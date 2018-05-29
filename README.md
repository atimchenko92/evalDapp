# evalDapp

Decentralized application, which manages the course evaluation by students, based on blockchain technology.
This is a sample implementation for Karlsruhe university of applied sciences (HSKA).

## Getting Started

To function well, evalDapp relies on some actions in real world.

#### The  Process
  Prerequisites: each student has his HSKA-Blockchain account already. (only for convinience purposes)

  1. The evaluation contract admin starts the Evaluation contract.
  2. Course lecturer gives the list preferably with X blank rows for classroom with X people.[This course should already be registered for evaluation inside Evaluation contract]
  3. Each student writes his existing account into blank space.
  4. After it is done, the lecturer checks if number of attendants is equal to the number of accounts written.
  5. Each course lecturer gives the list of attendant accounts to the evaluation contract admin.
  6. According to list, the admin gives specific funds (specific VoteToken and internal Eth to cover up gas).
  7. Student evaluates the course with his account.
  8. After the evaluation is expired, admin may end the evaluation process.
  9. The evaluation results will be presented in frontend.
  10. There will be small lottery in the end, where everyone has an equal chance to win the prize. (optional)

  Pros: The account is created and managed completely by a student.
  Cons: There is a "better" possibility for others to sniff on the student,
        based on his past evaluations.

  The problem still exists: what if admin won't send you funds for evaluation.

### Prerequisites

This app requires Node.js and its components to be installed.  

So firstly make sure you have installed [Node.js](https://nodejs.org/en/download/package-manager/)

Now having Node.js installed, install [Truffle](https://nodejs.org/en/download/package-manager/)

To prevent some dependency problems in future it is recommended to install Web3 aswell:
```
npm install web3
```

It is good to start with the [Ganache-Cli](http://truffleframework.com/docs/ganache/using) for local blockchain development.

This app is configured to run on localhost:8545. So if there is a need to use it
on the real blockchain network, consider changing the truffle.js settings.

[Metamask](https://metamask.io/) is a good tool to use normal Web-Browser as an web3-Browser.

This is basicaly a browser plugin which serves as a good tool to perform transactions on the blockchain.

### Installing

The first step would be to compile solidity contracts via truffle framework.  

Using terminal execute the following command:
```
truffle compile
```

This will create the binary versions of contracts in .json format and place it in
app/src/contracts/ directory.

The next step would be to install all the required node.js dependencies for the app
 according to package.json file in /app directory:

```
cd app
npm install
```

## Deployment

So by now we are ready to deploy our contracts to the blockchain.
Let's say we want to test it locally. Open the terminal somewhere and type in:
```
ganache-cli
```

This will start the local etherium blockchain. Now it is time to migrate our contracts
to the blockchain. Open the terminal and execute the following command in the main directory of the application:
```
truffle migrate
```

Now we are ready to start the application:
```
cd app
npm start
```

This will start the frontend on localhost:3000 by default. Don't forget to use metamask
  if you want to use a normal Web Browser.

## Built With
* [Npm](https://www.npmjs.com/) - main package manager
* [React](https://www.npmjs.com/package/create-react-app) - serves as frontend
* [Web3](https://www.npmjs.com/package/web3) - library for the decentralized communication between frontend and blockchain
* [Truffle](http://truffleframework.com/) - development framework for solidity contracts and deploy management

## Authors

Alexandr Timchenko  
Asis Schaumarow 

See also the list of [contributors](https://github.com/atimchenko92/elDapp/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details
