import { createPublicClient, getAddress, http, zeroAddress } from "viem";
import { skaleBlockBrawlers } from "viem/chains";
import { writeFile } from "fs/promises";
import * as path from "path";

type Balance = {
	user: string;
	balance: string;
}

const BLOCKSCOUT_NATIVE_GAS_URL = "https://frayed-decent-antares.explorer.mainnet.skalenodes.com/api?module=account&action=listaccounts";
const BLOCKSCOUT_HOLDERS_URL = "https://internal-hubs.explorer.mainnet.skalenodes.com:10021/api/v2/tokens/0x0cDf0cA966Fbd890dAC3Ea3226F348e2d5039B3a/holders";

const BLACKLIST = [
	"0xd2ba3e0000000000000000000000000000000000", // Etherbase
];

async function loadBalances(page: number, offset: number) {
	const url = `${BLOCKSCOUT_NATIVE_GAS_URL}&page=${page}&offset=${offset}`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	return await response.json();
}

async function loadEuropaHolders() {
	const url = new URL(BLOCKSCOUT_HOLDERS_URL);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP Error! Status: ${response.status}`);
	}

	return await response.json();
}

async function main() {
	console.time("Snapshot Completed In");

	const client = createPublicClient({
		chain: skaleBlockBrawlers,
		transport: http()
	});

	const block = await client.getBlock();


	let balances: Balance[] = [];
	let page = 1;
	const offset = 250;
	const MAX_BALANCE = BigInt("270000000000000000000000000");

	const euroapHolders = await loadEuropaHolders();
	// console.log("Europa Holders: ", euroapHolders);

	for (const holder of euroapHolders.items) {
		balances.push({
			user: getAddress(holder.address.hash),
			balance: holder.value
		})
	}

	console.log("Europa Balances Added to List");

	while (true) {
		// Construct the URL with page and offset parameters
		let prevAccountLength = balances.length;
		const data = await loadBalances(page, offset);

		const filteredList = data.result.filter((json: any) => {
			if (json.address !== zeroAddress 			// Filter out zeroAddress
				&& !BLACKLIST.includes(json.address)	// Filter out Blacklisted contracts
				&& json.balance !== "0" 				// Filter out 0
				&& BigInt(json.balance) <= MAX_BALANCE  // Filter out validator nodes on sChain who have > balance than possible
			) {
				return {
					address: json.address,
					balance: json.balance
				};
			}
		});

		balances.push(...filteredList);

		// Assuming the API returns an object with a "result" field containing the account list
		// const accounts: any[] = data.result || [];

		// Extract addresses (adjust this based on the actual structure of the response)
		// const addresses = accounts.map((account: any) => account.address);
		// allAccounts = allAccounts.concat(addresses);

		// Check if this is the last page
		if (balances.length === prevAccountLength) { // Compare this cycle to new legnth
		  break;
		} else {
		  page++; // Move to the next page
		}

		console.log(`Fetched page ${page - 1}, found ${balances.length} accounts`);
	}

	await writeFile(path.resolve(__dirname, `../snapshots/brawl-snapshot-${block.number}.json`), JSON.stringify({
		block: {
			number: block.number.toString(),
			hash: block.hash,
			timestamp: block.timestamp.toString()
		},
		data: {
			skaleChainName: "frayed-decent-antares",
			chainName: "BRAWL Chain",
			balances
		},
		timestamp: {
			str: new Date().toDateString(),
			num: Date.now()
		}
	}, null, 4));

	console.log("Addresses Tracked: ", balances.length);
	console.timeEnd("Snapshot Completed In");
	console.log("Snapshot written to: ", path.resolve(__dirname, `../snapshots/brawl-snapshot-${block.number}.json`));
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})