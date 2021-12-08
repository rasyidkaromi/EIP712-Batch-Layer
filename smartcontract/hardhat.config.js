require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "localhost",
  solidity: {
    version: "0.8.10" 
  },
  paths: {
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 99999,
      gas: 100000
    }
  }
};
