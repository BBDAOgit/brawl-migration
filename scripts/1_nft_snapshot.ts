import { createPublicClient, getContract, http } from "viem";
import { skaleBlockBrawlers } from "viem/chains";
import abi from "../abis/blockBrawlersERC721.abi.json";
import { writeFile } from "fs/promises";
import * as path from "path";

type Token = {
	tokenId: number;
	owner: string;
	heroCode: string;
}

async function main() {
	console.time("Snapshot Completed In");
	// TokenId => Owner
	let tokens: Token[] = [];

	const client = createPublicClient({
		chain: skaleBlockBrawlers,
		transport: http()
	});

	const block = await client.getBlock();

	const contractAddress = "0xdEEc08383309c20815ebfDf83BD762B5e5DDe8cA";
	
	const contract = getContract({
		abi,
		address: contractAddress,
		client
	});

	// 1 Get totalSupply
	const totalSupply = await contract.read.totalSupply() as bigint;
	console.log("Total Supply: ", totalSupply);

	const batchSize = 100;

	for (let i = 0; i < totalSupply; i += batchSize) {
		const batchCount = Math.min(batchSize, Number(totalSupply) - i);
		const batch = Array.from({ length: batchCount }, (_, idx) => i + idx);

		const data = await Promise.all(batch.map((async(num) => {
			return {
				tokenId: num,
				owner: (await contract.read.ownerOf([BigInt(num)]) as any) as `0x${string}`,
				heroCode: (await contract.read.getHero([BigInt(num)]) as any).toString()
			}
		})));

		tokens.push(...data);

		console.log("Items Remaining: ", totalSupply - BigInt(i));
	}

	await writeFile(path.resolve(__dirname, `../snapshots/nft-snapshot-${block.number}.json`), JSON.stringify({
		block: {
			number: block.number.toString(),
			hash: block.hash,
			timestamp: block.timestamp.toString()
		},
		data: {
			skaleChainName: "frayed-decent-antares",
			chainName: "BRAWL Chain",
			contract: {
				name: "BlockBrawlers",
				type: "ERC-721",
				address: contractAddress,
				abi
			},
			tokens,
			totalSupply: totalSupply.toString(),
		},
		timestamp: {
			str: new Date().toDateString(),
			num: Date.now()
		}
	}, null, 4));

	console.timeEnd("Snapshot Completed In");
	console.log("Snapshot written to: ", path.resolve(__dirname, `../snapshots/nft-snapshot-${block.number}.json`));
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})