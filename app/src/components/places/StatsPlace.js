import React, { Component } from 'react'

// Contract/truffle components
import { default as Web3} from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

// Child Components
import CourseStatPanel from '../fragments/CourseStatPanel'

// UI-Components
import { Table, Button } from 'react-bootstrap'

class StatsPlace extends Component {
  constructor(args){
    super(args);
    this.state = {
      loading: true,
      account: '0x0',
      isOwner: false,
      courses: [],
      courseInfo: {},
      evalInfo: []
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

    this.handleTextualDetailsClick
      = this.handleTextualDetailsClick.bind(this)
    this.handleNumericalDetailsClick
      = this.handleNumericalDetailsClick.bind(this)
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
    var statCourses = []

    if(!this.state.isOwner){
      let myCourses = await evalInstance.getAvailableCourses(this.state.account)
      for (var i = 0; i < myCourses.length; i++) {
        let courseInfo = await evalInstance.registeredCourses(myCourses[i])
        let courseName = await evalInstance.getCourseTitle(myCourses[i])
        let lecName = await evalInstance.getCourseLecturerName(myCourses[i])
        let ratio = (courseInfo[4].toNumber() === 0) ? 0
          : (courseInfo[5].toNumber() / courseInfo[4].toNumber())
        let evalInfo = await evalInstance
          .studentEvaluations(this.state.account, myCourses[i])
        statCourses.push({
          cId : myCourses[i].toNumber(),
          cTitle: courseName,
          cLec: lecName,
          cReg: courseInfo[4].toNumber(),
          cEval: courseInfo[5].toNumber(),
          cRatio: ratio,
          isEvaluated: evalInfo[1],
          hasNumerical: courseInfo[6],
          hasTextual: courseInfo[7]
        })
      }
    }
    else{
      let coursesCount = await evalInstance.coursesCount()
      for(i = 1; i <= coursesCount.toNumber(); i++){
        let courseInfo = await evalInstance.registeredCourses(i)
        let lecName = await evalInstance.getCourseLecturerName(i)
        let courseName = await evalInstance.getCourseTitle(i)
        let ratio = (courseInfo[4].toNumber() === 0) ? 0
          : (courseInfo[5].toNumber() / courseInfo[4].toNumber())
        statCourses.push({
          cId : i,
          cTitle: courseName,
          cLec: lecName,
          cReg: courseInfo[4].toNumber(),
          cEval: courseInfo[5].toNumber(),
          cRatio: ratio,
          hasNumerical: courseInfo[6],
          hasTextual: courseInfo[7]
        })
      }
    }

    this.setState({ courses: statCourses, chosenCourse: {}, loading : false})
  }

  handleTextualDetailsClick(e) {
    const cId = e.target.id
    this.evaluation.deployed().then( async(evalInstance) => {
      let accs = await evalInstance.getEvalAccountsByCourse(cId)
      for(var i = 0; i < accs.length; i++){

      }
    })
    this.setState({chosenCourse: {}, evalInfo: []})
  }

  handleNumericalDetailsClick(e) {
    var evalInfo = []
    var chosenCourse = {}

    const cId = parseInt(e.target.id, 10)
    var self = this
    this.evaluation.deployed().then( async(evalInstance) => {
      let accs = await evalInstance.getEvalAccountsByCourse(cId)
      let courseInfo = await evalInstance.registeredCourses(cId)
      const qMax = courseInfo[3]

      const clickedCourse = self.state.courses
        .find(course => course.cId === cId)

      chosenCourse = {isNumericalEvs: true,
        courseName: clickedCourse.cTitle}

      // Load up question bodies
      for(var i = 0; i < qMax; i++){
        let isTextual = await evalInstance.isTextualQuestion(cId, i)
        if(!isTextual){
          let qBody = await evalInstance.getQuestionBodyByCourse(cId, i)

          var tmpVal = 0
          var ignoredAccs = 0
          var partipAccs = accs.length
          //Loop through accounts
          for(var j = 0; j < accs.length; j++){
            let cEval = await evalInstance.readEvaluation(accs[j], cId, i)
            if(parseInt(cEval[0], 10) === 6)
              ignoredAccs++;
            else
              tmpVal += parseInt(cEval[0], 10)
          }

          partipAccs -= ignoredAccs

          if(partipAccs !== 0 )
            tmpVal /= partipAccs

          evalInfo.push({qId: i+1, qBody: qBody, mVal: tmpVal})
        }
      }
      this.setState({chosenCourse: chosenCourse, evalInfo: evalInfo})
    })
  }

  render() {
    let evStatus

    if(!this.state.isOwner){
      evStatus = <th>Evaluation status</th>
    }

    return(
      <span>
        {!this.state.loading ?
         <span>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Lecturer</th>
                <th>Number of registrations</th>
                <th>Number of evaluations</th>
                <th>Evaluation ratio</th>
                {evStatus}
                <th>Numerical evaluations</th>
                <th>Textual response</th>
              </tr>
            </thead>
            <tbody>
            {this.state.courses.map((course) => {
              return(
                <tr key={course.cId}>
                  <td>{course.cId}</td>
                  <td>{course.cTitle}</td>
                  <td>{course.cLec}</td>
                  <td>{course.cReg}</td>
                  <td>{course.cEval}</td>
                  <td>
                  {new Intl.NumberFormat('en-GB', {
                     style: 'percent',
                     minimumFractionDigits: 0,
                     maximumFractionDigits: 1
                   }).format(course.cRatio)}
                  </td>
                  {!this.state.isOwner ?
                    <td>{course.isEvaluated ? 'evaluated' : 'not evaluated'}
                    </td> :
                    null
                  }
                  <td>
                    <Button bsStyle="primary"
                      id={course.cId}
                      disabled={!course.hasNumerical}
                      onClick={this.handleNumericalDetailsClick}>
                      Show details
                    </Button>
                  </td>
                  <td>
                    <Button bsStyle="info"
                      id={course.cId}
                      disabled={!course.hasTextual}
                      onClick={this.handleTextualDetailsClick}>
                      Show details
                    </Button>
                  </td>
                </tr>
              )
            })}
            </tbody>
          </Table>
          <CourseStatPanel
            chosenCourse={this.state.chosenCourse}
            evalInfo={this.state.evalInfo}/>
        </span>:
        <span>Loading ...</span>}
      </span>
    )
  }
}

export default StatsPlace
