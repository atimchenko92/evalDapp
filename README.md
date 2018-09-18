# evalDapp

Decentralized application, which manages the course evaluation by students, based on blockchain technology.
This is a sample implementation for Karlsruhe University Of Applied Sciences (HSKA).

## Getting Started

To function well, evalDapp relies on some actions in real world. Such actions are marked with (*).

#### The  Process
  Prerequisites: each student has his HSKA-Blockchain account already. (only for convenience purposes)

  1. The admin migrates the evaluation contract to the blockchain. The registration for evaluation now begins.
  2. Each course lecturer gives the list preferably with N blank rows for classroom with N people.*
  3. Each student writes his existing account into blank space.*
  4. After it is done, the lecturer checks if number of attendants is equal to the number of accounts written.*
  5. Each course lecturer gives the list of attendant accounts to the evaluation contract admin.*
  6. According to list, the admin registers students for course evaluation and gives them (internal) Ethereum to cover up gas costs.
  7. Registered students evaluate the courses.
  8. After the evaluation is expired, admin may end the evaluation process.
  9. The evaluation results will be presented only after the evaluation ends, to avoid influence of current evaluation results.

  **Q:** But, what if admin won't send you funds for evaluation?

  **A:** Yes, it is a known design problem: we need to trust admins. It's still not clear how to make the whole process of evaluation without any communications in real world and trusting to anyone. Someone still needs to authenticate the student, if he allowed to vote for lecturer :(

### Prerequisites

This app requires Node.js and its components to be installed.  

So firstly make sure you have installed [Node.js](https://nodejs.org/en/download/package-manager/)

Now having Node.js installed, install [Truffle](https://nodejs.org/en/download/package-manager/)

To prevent some dependency problems in future it is recommended to install Web3 aswell:

```
npm install web3
```

It is good to start with the [Ganache-Cli](http://truffleframework.com/docs/ganache/using) for local blockchain development.

This app is configured to run localy. So if there is a need to use it
on the real blockchain network, consider changing the truffle.js settings.

[Metamask](https://metamask.io/) is a good tool to use normal Web-Browser as an web3-Browser.

This is a browser plugin which serves as a good tool to perform transactions on the blockchain.

### Installing

The first step would be to compile solidity contracts via truffle framework.  

Using terminal execute the following command in project folder:
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

This will start the local Etherium blockchain. Now it is time to migrate our contracts
to the blockchain. Open the terminal and execute the following command in the main directory of the application:
```
truffle migrate
```

Now we are ready to start the application:
```
cd app
npm start
```

This will start the frontend on localhost:3000 by default. Don't forget to use **Metamask**, if you want to use a normal Web Browser.

## Built With
* [Npm](https://www.npmjs.com/) - main package manager
* [React](https://www.npmjs.com/package/create-react-app) - serves as frontend
* [Web3](https://www.npmjs.com/package/web3) - library for the decentralized communication between frontend and blockchain
* [Truffle](http://truffleframework.com/) - development framework for solidity contracts and deploy management

## Authors

Alexandr Timchenko  
Aziz Shaumarov

See also the list of [contributors](https://github.com/atimchenko92/elDapp/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details
