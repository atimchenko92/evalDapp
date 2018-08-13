import React, { Component } from 'react'

// Contract/truffle components
import { default as Web3} from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

// UI-Components
class DemoToolsPlace extends Component {
  constructor(args){
    super(args);
    this.state = {
      isOwner: false,
      loading: true,
      account: '0x0',
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

    this.prepareInterval = 0
    this.evalInterval = 0
    this.progTimeLeft = 0
    this.progPercent = 0

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
      self.evaluation.deployed().then((evalInstance) => {
        self.loadBasicInfo(evalInstance)
      })
    });
  }

  async loadBasicInfo(evalInstance){
    let contractOwner = await evalInstance.owner()
    if(this.state.account !== contractOwner) {
      this.setState({isOwner: false, loading: false})
      return
    }
    //Load up things
    this.setState({ isOwner: true, loading: false})
  }

  render() {
    return(
      <span>
      </span>
    );
  }
}

export default DemoToolsPlace
