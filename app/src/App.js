import React, { Component } from 'react';
import './static/css/App.css';
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import evaluation_artifacts from './contracts/Evaluation.json';

// UI Components
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

    //bind events
    this.evaluationEvents = this.evaluationEvents.bind(this)
    this.handleCourseClick = this.handleCourseClick.bind(this)
    this.handleRegisterForEvalClick = this.handleRegisterForEvalClick.bind(this)
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
  //  alert(`selected register`+k);
  }

  handleCourseClick(k){
//    alert(`selected `);
  }

  loadCourseQuestions(){
    var self = this;
  }

  loadBasicContractInfo(){
    var self = this;
    this.evaluation.deployed().then((evalInstance) => {
      this.evalInstance = evalInstance
      this.evalInstance.owner().then((owner)=>{
        if(self.state.account === owner) {
          self.setState({isOwner: true})
        } else{
          self.setState({isOwner: false})
          self.loadAvailableCourses()
        }
        self.setState({loading: false})
      })
    });
  }

  loadAvailableCourses() {
    this.evaluation.deployed().then((evalInstance) => {
      this.evalInstance = evalInstance
      this.evaluationEvents()
      this.evalInstance.getAvailableCourses(this.state.account).then((myCourses) => {
        for (var i = 0; i < myCourses.length; i++) {
          this.evalInstance.registeredCourses(myCourses[i]).then((courseInfo) => {
            const coursesAvailable = [...this.state.coursesAvailable]
            coursesAvailable.push({
              id : courseInfo[0],
              cKey: courseInfo[1],
              lKey: courseInfo[2],
              qNum: courseInfo[3]
            });
            this.setState({ coursesAvailable: coursesAvailable })
          });
        }
      })
    })
  }

  evaluationEvents() {
    this.evalInstance.evaluatedEvent({}, {
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
          handleRegisterForEvalClick={this.handleRegisterForEvalClick.bind(this)}/>
        <Main/>
      </div>
    );
  }
}

export default App;
