import React, { Component } from 'react'

// Contract/truffle components
import { default as Web3} from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

class StatsPlace extends Component {
  constructor(args){
    super(args);
    this.state = {
      loading: true,
      account: '0x0',
      isOwner: false,
      timeState: ""
    }

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      this.provider = window.web3.currentProvider;
    } else {
      console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
    }
    window.web3 = new Web3(this.provider);

    this.evaluation = contract(evaluation_artifacts)
    this.evaluation.setProvider(this.provider)
  }

  componentDidMount(){
    var self = this;
    window.web3.eth.getCoinbase(function(err, account) {
      if (err != null) {
        alert("There was an error fetching your account.");
        console.log(err);
        return;
      }

      if (account == null) {
        alert("Couldn't load account! Make sure your Ethereum client is configured correctly.");
        return;
      }

      self.setState({account: account});
      self.evaluation.deployed().then( async(evalInstance) => {

        let contractOwner = await evalInstance.owner()
        if(self.state.account !== contractOwner)
          self.setState({isOwner: false})
        else
          self.setState({isOwner: true})

        self.loadBasicStatInfo(evalInstance)
      })
    });
  }

  async loadBasicStatInfo(evalInstance){
    //Example
    const courseToCheck = 3
    let cInfo = await evalInstance.registeredCourses(courseToCheck)
    const qNumber = cInfo[3]
    console.log("Stats of course #"+courseToCheck)
    for(var i = 0; i < qNumber; i++){
      let savedAns = await evalInstance
        .readEvaluation(this.state.account, courseToCheck, i)
      console.log(`Answer to question #${i}: ${savedAns}\n`)
    }
  }

  render() {
    return(
      <span>Hello Stats</span>
    );
  }
}

export default StatsPlace
