import React, { Component } from 'react'

// UI-Components
import { Table } from 'react-bootstrap'

class CourseEvalResult extends Component {
  render() {
    return(
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
        {this.props.evalInfo.map((ev) => {
          return(
            <tr>
              <td>{ev.qId}</td>
              <td>{ev.qBody}</td>
              <td>{ev.qAnswer}</td>
            </tr>
          )
        })}
        </tbody>
      </Table>
    )
  }
}

export default CourseEvalResult
