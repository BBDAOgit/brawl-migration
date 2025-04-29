import { createWalletClient, getAddress, http, nonceManager, zeroAddress } from "viem";
import { skaleNebula, skaleNebulaTestnet } from "viem/chains";
import HeroesNebulaABI from "../abis/brawlHeroes.abi.json";
import HeroesSnapshot from "../snapshots/nft-snapshot-7460737.json";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

type Hero = {
	to: `0x${string}`;
	tokenId: bigint;
	heroCode: bigint;
}

const isTestnet = false;

const chain = isTestnet ? skaleNebulaTestnet : skaleNebula;
const contractAddress = isTestnet ? "0x1845982514c7F1c7822f4F203acab40A615106fc" : "0xdEEc08383309c20815ebfDf83BD762B5e5DDe8cA"

async function main() {

	const PRIVATE_KEY = process.env.PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		throw new Error("Missign Private Key");
	}

	const walletClient = createWalletClient({
		chain: chain,
		transport: http(),
		account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`, {
			nonceManager
		})
	});

	const heroes: Hero[] = HeroesSnapshot.data.tokens.map((token) => {
		return {
			to: getAddress(token.owner),
			tokenId: BigInt(token.tokenId),
			heroCode: BigInt(token.heroCode)
		};
	}).filter((v) => v.to !== zeroAddress);

	// Should work for up to 13,000, limit 250
	for (let i = 0; i < heroes.length; i+=250) {
		const res = await walletClient.writeContract({
			abi: HeroesNebulaABI,
			address: contractAddress,
			functionName: "mintBatch",
			args: [
				heroes.slice(i, i+250)
			]
		});
		console.log("Batch Mint Transaction Hash: ", res);
	}
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})