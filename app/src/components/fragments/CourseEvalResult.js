import React, { Component } from 'react'

// UI-Components
import { Table } from 'react-bootstrap'

class CourseEvalResult extends Component {
  render() {
    return (
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
            return (
              <tr key={ev.qId}>
                <td>{ev.qId}</td>
                <td>{ev.qBody}</td>
                {ev.qTxtAnswer === "" ?
                  <td>{ev.qAnswer}</td> :
                  <td>{ev.qAnswer} ({ev.qTxtAnswer})</td>
                }
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  }
}

export default CourseEvalResult
