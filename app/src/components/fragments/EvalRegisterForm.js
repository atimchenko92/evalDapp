import React, { Component } from 'react'

// UI-Components
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'

class EvalRegisterForm extends Component {
  render() {
    return (
      <form className='myForm' onSubmit={this.props.handleEvalRegisterSubmit}>
        <FormGroup controlId="formControlAccount">
          <ControlLabel>Account</ControlLabel>
          <FormControl inputRef={val => this.props.handleAccInput(val)}
            type="text"
            placeholder="0x123..." />
        </FormGroup>
        <FormGroup controlId="formControlSelect">
          <ControlLabel>Course</ControlLabel>
          <FormControl inputRef={val => this.props.handleCourseInput(val)}
            componentClass="select"
            placeholder="Select course...">
            {this.props.allCourses.map((course) => {
              return (
                <option key={course.id.toNumber()} value={course.id.toNumber()}>
                  {course.cName}[id={course.id.toNumber()}]
                </option>
              )
            })}
          </FormControl>
        </FormGroup>
        <FormGroup controlId="formControlAmount">
          <ControlLabel>Eth amount</ControlLabel>
          <FormControl inputRef={val => this.props.handleEthInput(val)}
            type="text"
            placeholder="5000000000000000" />
        </FormGroup>
        <Button type="submit">Register for evaluation</Button>
      </form>
    )
  }
}

export default EvalRegisterForm
