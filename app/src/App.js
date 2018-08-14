import React, { Component } from 'react'
import history from './history'

//UI-Components
import './static/css/App.css'

//Contract/truffle components
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import evaluation_artifacts from './contracts/Evaluation.json';

// Child Components
import Header from './components/Header'
import Main from './components/Main'

class App extends Component {
  constructor(args){
    super(args);
    this.state = {
      isOwner: false,
      loading: true,
      account: '0x0',
      coursesAvailable: []
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

    //bind methods
    this.evaluationEvents = this.evaluationEvents.bind(this)
    this.handleCourseClick = this.handleCourseClick.bind(this)
    this.handleRegisterForEvalClick = this.handleRegisterForEvalClick.bind(this)
    this.handleDemoTools = this.handleDemoTools.bind(this)
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

  handleRegisterForEvalClick(){
    history.push('/register/')
  }

  handleCourseClick(k){
    history.push('/course/'+k)
  }

  handleDemoTools(){
    history.push('/demoTools/')
  }

  loadBasicContractInfo(){
    this.evaluation.deployed().then((evalInstance) => {
      this.loadAvailableCourses(evalInstance)
    });
  }

  async loadAvailableCourses(evalInstance) {
    var coursesAvailable = []
    let contractOwner = await evalInstance.owner()
    if(this.state.account === contractOwner) {
      this.setState({isOwner: true, loading: false})
      return
    }

    let myCourses = await evalInstance.getAvailableCourses(this.state.account)
    for (var i = 0; i < myCourses.length; i++) {

      let courseInfo = await evalInstance.registeredCourses(myCourses[i])
      let courseName = await evalInstance.getCourseTitle(myCourses[i])
      let evalInfo = await evalInstance
        .studentEvaluations(this.state.account, myCourses[i])

      coursesAvailable.push({
        id : courseInfo[0],
        cKey: courseInfo[1],
        lKey: courseInfo[2],
        qNum: courseInfo[3],
        cName: courseName,
        isEvaluated: evalInfo[1]
      });
    }
    this.evaluationEvents(evalInstance)
    this.setState({ coursesAvailable: coursesAvailable, isOwner:false,
      loading : false })
  }

  async evaluationEvents(evalInstance) {
    evalInstance.evaluatedEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      console.log("event casted!")
    })
  }

  render() {
    return (
      <div className="App">
        <Header
          account={this.state.account}
          isOwner={this.state.isOwner}
          loading={this.state.loading}
          coursesAvailable={this.state.coursesAvailable}
          handleCourseClick={this.handleCourseClick.bind(this)}
          handleDemoTools={this.handleDemoTools.bind(this)}
          handleRegisterForEvalClick={this.handleRegisterForEvalClick.bind(this)}/>
        <Main/>
      </div>
    );
  }
}

export default App;
