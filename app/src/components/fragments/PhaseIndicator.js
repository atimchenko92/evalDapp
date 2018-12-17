import React, { Component } from 'react'

// UI-Components
import {
  ButtonToolbar, Button, FormGroup,
  ControlLabel, FormControl, ProgressBar,
  Form, Col, Panel
} from 'react-bootstrap'

class PhaseIndicator extends Component {
  render() {
    var progWidget
    var contractInfoWidget
    switch (this.props.timeState) {
    case 'registr':
      progWidget = <span>
        <h2>Registration phase
                          ({this.props.generalInfo.prepareInterval} days overall)</h2>
        <ProgressBar bsStyle="info"
          now={this.props.progPercent}
          label={`${this.props.progTimeLeft} days till the evaluation`} />
      </span>
      break
    case 'eval':
      progWidget = <span>
        <h2>Evalutation phase
                          ({this.props.generalInfo.evalInterval} days overall)</h2>
        <ProgressBar bsStyle="success"
          now={this.props.progPercent}
          label={`${this.props.progTimeLeft} days till the end`} />
      </span>

      break
    case 'end':
      progWidget = <span><h2>Evalutation is complete</h2></span>

      break
    default: progWidget = null
    }
    contractInfoWidget = (
      <Panel className='myPanel'>
        <Panel.Heading>
          <Panel.Title componentClass="h3">General contract information</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal>
            <FormGroup controlId="sem">
              <Col componentClass={ControlLabel} sm={1}>
                Semester
              </Col>
              <Col sm={3}>
                <FormControl disabled type="text"
                  value={this.props.generalInfo.semester} />
              </Col>
              <Col componentClass={ControlLabel} sm={1}>
                Current date
              </Col>
              <Col sm={3}>
                <FormControl disabled type="text"
                  value={new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                  }).format(this.props.generalInfo.testNowDate)} />
              </Col>
            </FormGroup>
            <FormGroup controlId="evalTimes">
              <Col componentClass={ControlLabel} sm={1}>
                Evaluation initialized
              </Col>
              <Col sm={3}>
                <FormControl disabled type="text"
                  value={new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                  }).format(this.props.generalInfo.initDate)} />
              </Col>
              <Col componentClass={ControlLabel} sm={1}>
                Evaluation starts
              </Col>
              <Col sm={3}>
                <FormControl disabled type="text"
                  value={new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                  }).format(this.props.generalInfo.startDate)} />
              </Col>
              <Col componentClass={ControlLabel} sm={1}>
                Evalutaion ends
              </Col>
              <Col sm={3}>
                <FormControl disabled type="text"
                  value={new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                  }).format(this.props.generalInfo.endDate)} />
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>
      </Panel>
    )
    return (
      <span>
        {progWidget}
        {contractInfoWidget}
        {this.props.adminMode ?
          <Panel className='myPanel'>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Admin Panel</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <FormGroup controlId="timeField">
                <ControlLabel>Time in days</ControlLabel>
                <FormControl type="text"
                  placeholder="Days"
                  onChange={this.props.handleTimeInput} />
              </FormGroup>
              <ButtonToolbar>
                <Button bsStyle="primary"
                  onClick={this.props.handleTimeIncrease}>Increase time</Button>
                <Button bsStyle="primary"
                  onClick={this.props.handleTimeDecrease}>Decrease time</Button>
              </ButtonToolbar>
            </Panel.Body>
          </Panel>
          : null}
      </span>
    )
  }
}

export default PhaseIndicator
