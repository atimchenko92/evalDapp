import React, { Component } from 'react';

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
      curQuestion: {},
      curAnswers: []
    }
  }

  componentWillMount(){
    //TODO: read question routine
    var curAnswers = [];
    curAnswers.push({id: 1, text: 'Not good'})
    curAnswers.push({id: 2, text: ''})
    curAnswers.push({id: 3, text: ''})
    curAnswers.push({id: 4, text: ''})
    curAnswers.push({id: 5, text: 'Very good'})

    this.setState({ curAnswers: curAnswers })

    var curQuestion = {cId: 3, qId: 3, qText: "3. How would you rate it?", isTextual: false, isFirst: false, isLast: true}
    this.setState({ curQuestion: curQuestion })
  }

  handlePagerClick (){
    //TODO: get ready for next question
  }

  render() {
    return(
      <div>
        <QuestionContainer qInfo={this.state.curQuestion} qAnswers={this.state.curAnswers}
        handlePagerClick={this.handlePagerClick.bind(this)} />
      </div>
    );
  }
}

export default CourseEvalPlace
