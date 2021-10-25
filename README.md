# nft-distributor

This is a NFT distributor where you can easily distribute a set of 1/1 NFTs to a list of addresses.

### Pre-requisites

1. Create a new wallet, either Sollet/Phantom works fine.
2. Mint the desired number of NFTs to the wallet either through [Metaplex](https://github.com/metaplex-foundation/metaplex) or other valid ways. **Note: make sure that the wallet only holds SOL and the NFT collection that you want to distribute**

Remember to have enough SOL in the wallet to cover the gas fees required to send the transactions.

### To run the program

Install dependencies:

```
npm install
```

You will need to create the following files to be able to run the program:
- addresses.csv
    - a list of wallet addresses to send the NFTs to (see `sample_addresses.csv` for reference)
- .env
    - populate the variables from `.env.default` with the respective values and copy to a new file `.env`


Run program:

```
node index.js
```

### How the program works

The program scans the given wallet address for all tokens that have an amount of 1 or more and sends each of these tokens to each address specified in addresses.csv. (1 address = 1 token) The program will write successful transactions to success.csv with each row having the destination wallet address and the transaction signature. The program will write failed transactions to failed.csv with each row having the destination wallet address. After the program finishes running, you may wish to copy the transactions in success.csv to a new file to keep a record of the successful transactions. Run the program again until there's no more failed addresses in failed.csv

Note: The reason why there is a failure list is that Solana transcations can fail due to various reasons and therefore we would have to rerun the failed transactions.
