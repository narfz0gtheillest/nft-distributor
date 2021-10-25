# nft-distributor

This is a NFT distributor where you can easily distribute a set of 1/1 NFTs to a list of addresses.

### Pre-requisites

1. Create a new wallet, either Sollet/Phantom works fine.
2. Mint the desired number of NFTs to the wallet either through [Metaplex](https://github.com/metaplex-foundation/metaplex) or other valid ways. **Note: make sure that the wallet only holds SOL and the NFT collection that you want to distribute**

Remember to have enough SOL in the wallet to cover the gas fees required to send the transactions.

### Running the program

Install dependencies:

```
npm install
```

Create the following files to configure the program:
- `addresses.csv` -- a list of wallet addresses to send the NFTs to (see `sample_addresses.csv` for reference)
- `.env` -- populate the variables from `.env.default` with the respective values and copy to a new file `.env`

Run program:

```
node index.js
```

This command scans the given wallet address (in `.env`) for all tokens that have an amount of 1 or more and sends one of these tokens to each address in `addresses.csv`. The program writes successful transactions to `success.csv` with each row having the destination wallet address and the transaction signature. The program writes failed transactions to `failed.csv` with each row having the destination wallet address.

You likely want to rerun the program to resubmit any failed transactions. Solana transactions can fail for various reasons, many of which are transient failures and that are solved by simply retrying them. You can resubmit these transactions by copying `failed.csv` to `addresses.csv` and rerunning the program. Note that you may also wish to copy `success.csv` and `addresses.csv` to new files in order to keep a record of the successful transactions.
