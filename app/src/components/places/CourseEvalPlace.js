import React, { Component } from 'react';
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import evaluation_artifacts from '../../contracts/Evaluation.json';

// UI Components
import QuestionContainer from '../fragments/QuestionContainer'

class CourseEvalPlace extends Component {
  constructor(args){
    super(args);
    this.state = {
      isAvailable: false,
      isEvaluated: true,
      loading: true,
      account: '0x0',
      currentCourse: this.props.match.params.number,
      courseQuestions: [],
      curQuestion: {}
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
    this.handlePagerClick = this.handlePagerClick.bind(this);
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
      self.loadBasicCourseInfo();
    });
  }

  loadBasicCourseInfo (){
    var courseQuestions = []
    //Mock questions: #1
    var cQuestion_1 = {qId: 1, qText: "1. How would you rate sandwich?",
     isTextual: false, isFirst: true,
     isLast: false, answers: [], chosenAnswer: ""}
    //Add answers
    cQuestion_1.answers.push({id: 1, text: 'Not good'})
    cQuestion_1.answers.push({id: 2, text: ''})
    cQuestion_1.answers.push({id: 3, text: ''})
    cQuestion_1.answers.push({id: 4, text: ''})
    cQuestion_1.answers.push({id: 5, text: 'Very good'})

    //#2
    var cQuestion_2 = {qId: 2, qText: "2. How would you rate cola?",
     isTextual: false, isFirst: false,
     isLast: false, answers: [], chosenAnswer: ""}

    cQuestion_2.answers.push({id: 1, text: 'Not good'})
    cQuestion_2.answers.push({id: 2, text: ''})
    cQuestion_2.answers.push({id: 3, text: ''})
    cQuestion_2.answers.push({id: 4, text: ''})
    cQuestion_2.answers.push({id: 5, text: 'Very good'})

    //#3
    var cQuestion_3 = {qId: 3, qText: "3. How would you rate vodka?",
     isTextual: false, isFirst: false,
     isLast: true, answers: [], chosenAnswer: ""}

    cQuestion_3.answers.push({id: 1, text: 'Not good'})
    cQuestion_3.answers.push({id: 2, text: ''})
    cQuestion_3.answers.push({id: 3, text: ''})
    cQuestion_3.answers.push({id: 4, text: ''})
    cQuestion_3.answers.push({id: 5, text: 'Very good'})


    courseQuestions.push(cQuestion_1)
    courseQuestions.push(cQuestion_2)
    courseQuestions.push(cQuestion_3)

    this.setState({ courseQuestions: courseQuestions, curQuestion: cQuestion_1 })
    this.setState({loading : false})
  }

   handlePagerClick (k){
    if(k==="next"){
      const resNext = this.state.courseQuestions.find(course => course.qId === (this.state.curQuestion.qId + 1))
      this.setState({ curQuestion: resNext })
      return resNext.qId;
    }
    else if (k==="prev") {
      const resPrev = this.state.courseQuestions.find(course => course.qId === (this.state.curQuestion.qId - 1))
      this.setState({ curQuestion: resPrev })
      return resPrev.qId;
    }
    else{
      console.log("bad state")
    }
  }

  render() {
    return(
      <span>
        {!this.state.loading ?
        <QuestionContainer qInfo={this.state.curQuestion}
         handlePagerClick={this.handlePagerClick.bind(this)} /> :
         <span>Loading...</span>
        }
      </span>
    );
  }
}

export default CourseEvalPlace
