import React, { Component } from 'react'

// UI-Components
import { Table, Panel } from 'react-bootstrap'

class CourseStatPanel extends Component {
  render() {
    var panelTitle
    const {course} = this.props.currentCourse

    if(course === undefined){
      panelTitle = "Detailed statistics"
    }
    else{
      var titleAfter = (this.props.isNumericalEvs ? 'Numerical evaluations': 'Textual response')
      panelTitle = `${course.courseName} : ${titleAfter}`
    }

    return(
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3">{panelTitle}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
        {course === undefined ?
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
               <tr>
                 <td>{ev.qId}</td>
                 <td>{ev.qBody}</td>
                 <td>0</td>
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
