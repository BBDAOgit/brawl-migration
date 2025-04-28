import { createWalletClient, http, nonceManager } from "viem";
import { skaleNebula, skaleNebulaTestnet } from "viem/chains";
import BrawlTokenNebulaABI from "../abis/brawlTokenNebula.abi.json";
import TokenSnapshot from "../snapshots/brawl-snapshot-7461153.json";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

type Token = {
	address: `0x${string}`;
	balance: string;
	stale?: boolean;
}

const isTestnet = true;

const chain = isTestnet ? skaleNebulaTestnet : skaleNebula;
const contractAddress = isTestnet ? "0x0cDf0cA966Fbd890dAC3Ea3226F348e2d5039B3a" : "0x"

async function main() {

	const PRIVATE_KEY = process.env.PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		throw new Error("Missing Private Key");
	}

	const walletClient = createWalletClient({
		chain: chain,
		transport: http(),
		account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`, {
			nonceManager
		}),
		pollingInterval: 250
	});

	const dropList: Token[] = (TokenSnapshot.data.balances as Token[]).filter((v) => {
		if (v.balance !== "" && BigInt(v.balance) > BigInt(0)) {
			return v;
		}
	});

	const addresses = dropList.map((v) => v.address);
	const balances = dropList.map((v) => v.balance);

	for (let i = 0; i < balances.length; i+=50) {
		const res = await walletClient.writeContract({
			abi: BrawlTokenNebulaABI,
			address: contractAddress,
			functionName: "batchMint",
			args: [
				addresses.slice(i, i+50),
				balances.slice(i, i+50).map((v) => BigInt(v))
			],
			gas: BigInt(100_000_000)
		});
		console.log("Batch Mint Transaction Hash: ", res);
	}
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})