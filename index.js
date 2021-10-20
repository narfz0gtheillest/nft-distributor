var web3 = require("@solana/web3.js");
var splToken = require("@solana/spl-token");

const csv = require("csv-parser");
const fs = require("fs");

require("dotenv").config();

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriterSuccess = createCsvWriter({
  path: "success.csv",
  header: ["walletAddress", "signature"],
});
const csvWriterFailed = createCsvWriter({
  path: "failed.csv",
  header: ["walletAddress"],
});

const data = JSON.parse(process.env.SECRET_KEY);
const secretKey = Uint8Array.from(data);

const addresses = [];

fs.createReadStream("addresses.csv")
  .pipe(csv(["address"]))
  .on("data", (data) => addresses.push(data));

(async () => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl(process.env.CLUSTER),
    process.env.COMMITMENT
  );

  const from = web3.Keypair.fromSecretKey(secretKey);

  // Get all token accounts from the specified wallet address env var
  const accounts = await connection.getParsedProgramAccounts(
    new web3.PublicKey(splToken.TOKEN_PROGRAM_ID),
    {
      filters: [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: process.env.WALLET_ADDRESS,
          },
        },
      ],
    }
  );

  const results = accounts.filter(
    (account) => account.account.data.parsed.info.tokenAmount.amount >= 1
  );
  console.log(results.length);
})();
