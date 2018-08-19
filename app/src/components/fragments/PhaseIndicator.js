import React, { Component } from 'react'

// UI-Components
import {  ButtonToolbar, Button, FormGroup,
  ControlLabel, FormControl, ProgressBar } from 'react-bootstrap'

class PhaseIndicator extends Component {
  render() {
    return(
      <span>
        {this.props.timeState === "registr" ?
          <span>
            <h2>
              Registration phase
            </h2>
            <ProgressBar bsStyle="info"
              now={this.props.progPercent}
              label={`${this.props.progTimeLeft} days till the end`} />
          </span>
          :
          <span>
            <h2>
              Evalutation phase
            </h2>
            <ProgressBar bsStyle="success"
              now={this.props.progPercent}
              label={`${this.props.progTimeLeft} days till the end`} />
          </span>
          }
          {this.props.adminMode ?
          <span>
            <FormGroup controlId="timeField">
              <ControlLabel>Time in days</ControlLabel>
              <FormControl type="text"
                placeholder="Days"
                onChange={this.props.handleTimeInput}/>
            </FormGroup>
            <ButtonToolbar>
              <Button bsStyle="primary"
                onClick={this.props.handleTimeIncrease}>Increase time</Button>
              <Button bsStyle="primary"
                onClick={this.props.handleTimeDecrease}>Decrease time</Button>
            </ButtonToolbar>
          </span>
          :null}
      </span>
    );
  }
}

export default PhaseIndicator
