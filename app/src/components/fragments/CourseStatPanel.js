import React, { Component } from 'react'

// UI-Components
import { Table, Panel, Alert, Carousel, Jumbotron } from 'react-bootstrap'

class CourseStatPanel extends Component {
  render() {
    var panelTitle
    var emptyBodyElem = null
    var contentBody = null

    if(this.props.chosenCourse.isNumericalEvs){
      contentBody = <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Mean value</th>
          </tr>
        </thead>
        <tbody>
        {this.props.evalInfo.map((ev) => {
          return(
            <tr key={ev.qId}>
              <td>{ev.qId}</td>
              <td>{ev.qBody}</td>
              <td>
              {new Intl.NumberFormat('en-GB', {
                 style: 'decimal',
                 minimumFractionDigits: 0,
                 maximumFractionDigits: 1
               }).format(ev.mVal)}
              </td>
            </tr>
          )
        })}
        </tbody>
      </Table>;
    }
    else{
      if(this.props.txtInfo.length !== 0){
        contentBody =
          <Carousel>
          {this.props.txtInfo.map((ev) => {
            return(
              <Carousel.Item key={ev.id}>
                <Jumbotron>
                 <h1>Question#{ev.qId}: {ev.qBody}</h1>
                 <p>{ev.qAns}</p>
                </Jumbotron>
              </Carousel.Item>
            )
          })}
          </Carousel>
      }
      else{
        contentBody =
        <Jumbotron>
         <h1>No textual answers for this course</h1>
         <p>Looks like nobody has submitted a <strong>meaningful</strong>
          textual response yet :( </p>
        </Jumbotron>
      }

    }

    if(!this.props.isAccessible){
      emptyBodyElem = <Alert bsStyle="warning">
        <strong>Hi there!</strong>
         The detailed statistics will be available after the end of evaluation
        </Alert>
    }
    else {
      emptyBodyElem = <span>Nothing to do here</span>
    }

    if(this.props.chosenCourse.courseName === undefined){
      panelTitle = "Detailed statistics"
    }
    else{
      var titleAfter = (this.props.chosenCourse.isNumericalEvs ?
        'Numerical evaluations' :
        'Textual response')
      panelTitle = `${this.props.chosenCourse.courseName} : ${titleAfter}`
    }

    return(
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3">{panelTitle}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
        {this.props.chosenCourse.courseName === undefined ?
          <span>
            {emptyBodyElem}
          </span>
         :
          <span>
            {contentBody}
          </span>
        }

        </Panel.Body>
      </Panel>
    )
  }
}

export default CourseStatPanel
