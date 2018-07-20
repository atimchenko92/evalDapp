import React, { Component } from 'react'

// Contract/truffle components
import { default as Web3} from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

// Child Components
import EvalRegisterForm from '../fragments/EvalRegisterForm'

class EvalRegisterPlace extends Component {
  constructor(args){
    super(args);
    this.state = {
      isOwner: false,
      loading: true,
      account: '0x0',
      allCourses: []
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

    this.myRefs = {};
    this.handleEvalRegisterSubmit = this.handleEvalRegisterSubmit.bind(this);
    this.handleAccInput = this.handleAccInput.bind(this);
    this.handleEthInput = this.handleEthInput.bind(this);
    this.handleCourseInput = this.handleCourseInput.bind(this);
  }

  componentWillMount(){
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
      self.loadBasicContractInfo();
    });
  }

  loadBasicContractInfo(){
    var self = this;
    this.evaluation.deployed().then((evalInstance) => {
      this.evalInstance = evalInstance
      this.evalInstance.owner().then((owner)=>{
        if(self.state.account === owner) {
          self.setState({isOwner: true})
          self.loadAllCourses()
        } else{
          self.setState({isOwner: false})
        }
        self.setState({loading: false})
      })
    });
  }

  loadAllCourses(){
    var self = this;
    this.evaluation.deployed().then((evalInstance) => {
      this.evalInstance = evalInstance;
      var self2 = this;
      this.evalInstance.coursesCount().then((coursesCount)=>{
        console.log(coursesCount.toNumber())
        for(var i = 1; i <= coursesCount.toNumber(); i++){
          self2.evalInstance.registeredCourses(i).then((courseInfo) => {
            const currentCourses = [...self.state.allCourses]
            currentCourses.push({
              id : courseInfo[0],
              cKey: courseInfo[1],
              lKey: courseInfo[2],
              qNum: courseInfo[3]
            });
            self.setState({ allCourses: currentCourses})
          });
        }
      });
    });
  }

  handleEvalRegisterSubmit(e){
    if(e) e.preventDefault();
    var self = this
    this.evaluation.deployed().then((evalInstance) => {
      var acc = this.myRefs.accountInput.value
      var courseId = this.myRefs.courseInput.value
      var ethAmount = this.myRefs.ethInput.value
      evalInstance.registerAccountForCourseEval(acc, courseId, {from: self.state.account, value: ethAmount }).then((receipt) => {
      })
    })
  }

  handleAccInput(e){
    this.myRefs.accountInput = e
  }

  handleCourseInput(e){
   this.myRefs.courseInput = e
  }

  handleEthInput(e){
   this.myRefs.ethInput = e
  }

  render() {
    return(
      this.state.loading ?
        <span> Loading ... </span> :
      (this.state.isOwner ?
        <EvalRegisterForm
          allCourses={this.state.allCourses}
          handleEvalRegisterSubmit={this.handleEvalRegisterSubmit.bind(this)}
          handleAccInput={this.handleAccInput.bind(this)}
          handleEthInput={this.handleEthInput.bind(this)}
          handleCourseInput={this.handleCourseInput.bind(this)}/> :
        <span> Sorry! Only for Admins</span>)
    );
  }
}
export default EvalRegisterPlace
