import React, { Component } from 'react'

// UI-Components
import { Table, Panel, Alert } from 'react-bootstrap'

class CourseStatPanel extends Component {
  render() {
    var panelTitle
    var emptyBodyElem = null

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
          <span>{emptyBodyElem}</span>
         :
         <Table striped bordered condensed hover>
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
                 <td>{ev.mVal}</td>
               </tr>
             )
           })}
           </tbody>
         </Table>
        }
        </Panel.Body>
      </Panel>
    )
  }
}

export default CourseStatPanel
