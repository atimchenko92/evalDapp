var path = require('path');
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts/"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
       gas: 4000000,          //4Mwei
       gasPrice: 20000000000, //20Gwei
      network_id: "*" // Match any network id
    }
  }
};
