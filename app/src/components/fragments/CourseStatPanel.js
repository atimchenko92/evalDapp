import React, { Component } from 'react'

// UI-Components
import { Table, Panel } from 'react-bootstrap'

class CourseStatPanel extends Component {
  render() {
    var panelTitle

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
          <span>Nothing to do here</span>
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
