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

const secretKey = Uint8Array.from(JSON.parse(process.env.SECRET_KEY));

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
  console.log(`Number of NFTs available to send: ${results.length}`);

  if (results.length > 0) {
    for (let i = 0; i < addresses.length; i++) {
      const token = new splToken.Token(
        connection,
        new web3.PublicKey(results[i].account.data.parsed.info.mint),
        splToken.TOKEN_PROGRAM_ID,
        from
      );
      const token_account_address = results[i].pubkey;
      const to = new web3.PublicKey(addresses[i].address);
      let associated_token_acc;
      try {
        associated_token_acc = await token.getOrCreateAssociatedAccountInfo(to);
      } catch (error) {
        await csvWriterFailed.writeRecords([{ walletAddress: to.toString() }]);
        console.log("FAILED");
        console.log(error);
        continue;
      }
      const associated_token_acc_add = associated_token_acc.address;
      // Add token transfer instructions to transaction
      const transaction = new web3.Transaction().add(
        splToken.Token.createTransferInstruction(
          splToken.TOKEN_PROGRAM_ID,
          token_account_address,
          associated_token_acc_add,
          from.publicKey,
          [],
          1
        )
      );

      try {
        // Sign transaction, broadcast, and confirm
        const signature = await web3.sendAndConfirmTransaction(
          connection,
          transaction,
          [from],
          { commitment: process.env.COMMITMENT }
        );
        await csvWriterSuccess
          .writeRecords([{ walletAddress: to.toString(), signature }])
          .catch((err) => {
            console.log("Save failed", err);
          });
        console.log(`Transaction succeeded: ${signature}`);
      } catch (error) {
        await csvWriterFailed.writeRecords([{ walletAddress: to.toString() }]);
        console.log(`Transaction failed: ${error}`);
      }
    }
  }
})();
