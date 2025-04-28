# Brawl Migration Contracts

## Setup

1. Run `cp .env.example .env` and copy the same private key in that you used in the root
2. Run `forge solder install` to install Soldeer managed dependencies
3. Run `forge compile` to make sure everything builds
4. Visit https://sfuelstation.com and gas up your wallet on Nebula Mainnet & Testnet

## Deploying to Testnet

1. Run `forge clean`
2. Run:
```shell
forge script ./scripts/DeployTestnet.s.sol --legacy --broadcast --slow
```

## Deploying to Mainnet
1. Run `forge clean`
2. Run:
```shell
forge script ./scripts/DeployMainnet.s.sol --legacy --broadcast --slow
```

> Note, if your wallet is not whitelisted this will fail

## Foundry Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```