# Brawl Migration

This repo is a community good project to help users of the BRAWL Chain preserve their assets on SKALE with the BRAWL team no longer able to support with their chain payment.

The author is not a member of the BRAWL team and has no affiliation with the team. When a blockchain is being taken down, including a SKALE Chain, assets need to be either withdrawn from the bridge (when possible) OR migrated to a new chain.

This repo is open-sourced under the MIT License.

## Setup & Installation

1. Clone the repo: https://github.com/thegreataxios/brawl-migration --recurse-submodules
> Note if you don't install the submodules, the /contracts dir will not compile correctly
2. Run `npm install`
3. Run `cp .env.example .env`, add in PRIVATE_KEY starting with 0x

> Note if you don't have Node v23.x install with nvm

For setup & deployment of contracts, see [./contracts/README](./contracts/README.md)

## Scripts

### NFT (ERC-721) Snapshot

The NFT Snapshot grabs the BlockBrawlers contract on the BRAWL SKALE Chain and loops through the token ids to grab the owner and the hero code.

```shell
npm run snapshot::nft
```

### BRAWL (ERC-20) Snapshot

The BRAWl Snapshot grabs the BRAWL ERC-20 contract on the BRAWL SKALE Chain and loops through the token ids to grab the owner and the hero code.

> Note, due to the unique design of BRAWL ontop of the sFUEL token; this filters out Etherbase and SKALE Validators

```shell
npm run snapshot::brawl
```

This will write to the [snapshots](/snapshots) folder.
See [Snapshots](#snapshots) below for more information.

## Snapshots

Q: What is a snapshot?
---
A: Simple! A snapshot is a set of structured data representing some information at some given point in time.

Q: What is the format?
---
A: The stored format is a JSON file with the data, timestamp, and block information. The name of the file is snapshot-type-blocknum.json.