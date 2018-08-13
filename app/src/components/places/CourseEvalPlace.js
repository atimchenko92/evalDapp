import React, { Component } from 'react'
import history from '../../history'

// Contract/truffle components
import { default as Web3} from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

// Child Components
import QuestionContainer from '../fragments/QuestionContainer'

// UI-Components
import { Button } from 'react-bootstrap'

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

    console.log("In course place:"+this.state.currentCourse)

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

    this.handlePagerClick = this.handlePagerClick.bind(this);
    this.handleAnswerClick = this.handleAnswerClick.bind(this);
    this.handleAnswerTextual = this.handleAnswerTextual.bind(this);
    this.handleValidationState = this.handleValidationState.bind(this);
    this.handleCourseEvaluation = this.handleCourseEvaluation.bind(this);
    this.setState({currentCourse: args.match.params.number});
  }

  static getMaxTextLength() {
    return 128;
  }

  componentDidMount(){
    console.log("in course eval place")
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
      self.loadBasicCourseInfo(self.state.currentCourse);
    });
  }

  async loadBasicCourseInfo (courseToBeLoaded){
    this.setState({ currentCourse: courseToBeLoaded})
    this.evaluation.deployed().then((evalInstance) => {
      this.evalInstance = evalInstance
      this.loadCourseQuestions(evalInstance, courseToBeLoaded)
    })
  }

  async loadCourseQuestions(evalInstance, courseToBeLoaded){
    var curQuestion = {}
    var courseQuestions = []

    let isAvailable = await evalInstance
      .checkRegistration(this.state.account, courseToBeLoaded)
    if(isAvailable === false){
      this.setState({ courseQuestions: [],
        curQuestion: {}, loading : false})
    } else {
      let courseInfo = await evalInstance.registeredCourses(courseToBeLoaded)
      const qMax = courseInfo[3];
      //Load questions
      for (var i = 1; i <= qMax; i++) {
        let qBody = await evalInstance
          .getQuestionBodyByCourse(courseToBeLoaded, i)
        curQuestion = {qId: i, qText: qBody,
         isTextual: false, isFirst: (i === 1) ? true : false,
         isLast: (i === qMax.toNumber()) ? true : false,
         answers: [], chosenAnswer: "", isValidAnswer: false
       }

        let maxAnswers = await evalInstance
          .getMaxAnswerForQuestionWrapper(courseToBeLoaded, i)

        if(maxAnswers.toNumber() === 0){
          curQuestion.isTextual = true
          curQuestion.isValidAnswer = true
        }

        //Load answers:
        for (var j = 1; j <= maxAnswers; j++){
          let ansText = await evalInstance
            .getRatingTextForValWrapper(courseToBeLoaded, i, j)
          curQuestion.answers.push({id: j, text: ansText})
        }
        courseQuestions.push(curQuestion)
      }
      this.setState({ courseQuestions: courseQuestions,
        curQuestion: courseQuestions[0], loading : false,
        isAvailable : true})
    }
  }

  isCourseReadyForEvaluation(){
    const cQuest = this.state.courseQuestions
      .find(question => question.isValidAnswer === false)

    if(typeof cQuest === "undefined")
      return true
    else
      return false
  }

  handlePagerClick (k){
    if(k==="next"){
      const resNext = this.state.courseQuestions.find(course => course.qId === (this.state.curQuestion.qId + 1))
      this.setState({ curQuestion: resNext })
      history.push('/course/'+this.state.currentCourse+'?qId='+ resNext.qId);
    }
    else if (k==="prev") {
      const resPrev = this.state.courseQuestions.find(course => course.qId === (this.state.curQuestion.qId - 1))
      this.setState({ curQuestion: resPrev })
      history.push('/course/'+this.state.currentCourse+'?qId='+ resPrev.qId);
    }
    else return
  }

  handleAnswerTextual (e){
    const qCopy = this.state.curQuestion
    qCopy.chosenAnswer = e.target.value
    this.setState({curQuestion: qCopy})
  }

  handleAnswerClick(k) {
    const qCopy = this.state.curQuestion
    qCopy.chosenAnswer = k
    qCopy.isValidAnswer = true
    this.setState({ curQuestion: qCopy })
  }

  handleValidationState() {
    const length = this.state.curQuestion.chosenAnswer.length;
    const qCopy = this.state.curQuestion
    if (length <= CourseEvalPlace.getMaxTextLength()){
      qCopy.isValidAnswer = true;
      return 'success';
    }
    else if (length > CourseEvalPlace.getMaxTextLength()) {
      qCopy.isValidAnswer = false;
      return 'error';
    }
    return null;
  }

  handleCourseEvaluation() {
    var uintAnswers = []
    var txtAnswers = ""

    for(var i = 0; i < this.state.courseQuestions.length; i++){
      if (this.state.courseQuestions[i].isTextual){
        txtAnswers = txtAnswers + "//" + this.state.courseQuestions[i].chosenAnswer
      }
      else{
        uintAnswers.push(this.state.courseQuestions[i].chosenAnswer)
      }
    }
    this.evaluation.deployed().then((evalInstance) => {
      this.handleEvaluation(evalInstance, uintAnswers, txtAnswers)
    })
  }

  async handleEvaluation(evalInstance, uintAnswers, txtAnswers){
    await evalInstance.evaluateCourse(this.state.currentCourse, uintAnswers,
      txtAnswers, {from: this.state.account})
  }

  render() {
    const isRdyForEval = this.isCourseReadyForEvaluation()

    if(this.props.match.params.number !== this.state.currentCourse)
      this.loadBasicCourseInfo(this.props.match.params.number)

    return(
      <span>
        {!this.state.loading ?
          <span>
          {this.state.isAvailable ?
            <span>
              <QuestionContainer
                qInfo={this.state.curQuestion}
                currentCourse={this.state.currentCourse}
                handleValidationState={this.handleValidationState.bind(this)}
                handleAnswerClick={this.handleAnswerClick.bind(this)}
                handleAnswerTextual={this.handleAnswerTextual.bind(this)}
                handlePagerClick={this.handlePagerClick.bind(this)}/>
              <Button bsStyle="success"
                onClick={this.handleCourseEvaluation}
                disabled={!isRdyForEval}>
                Evaluate the course
              </Button>
            </span>:
            <span>Sorry, you are not yet registered
            for this course evaluation</span>
          }
          </span>:
          <span>Loading...</span>
        }
       </span>
    );
  }
}

export default CourseEvalPlace
