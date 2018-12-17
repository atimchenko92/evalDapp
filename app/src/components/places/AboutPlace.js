import React, { Component } from 'react'

// UI-Components
import { Panel } from 'react-bootstrap'
import procPic from '../../static/images/process.png'

class AboutPlace extends Component {
  render() {
    return (
      <span>
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h3">
              How does the evaluation process looks like?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <img src={procPic} alt="Evaluation process"
              className='picStyle' />
          </Panel.Body>
          <Panel.Footer>
            More info on
            <a href="https://github.com/atimchenko92/evalDapp"> GitHub Repository</a>
          </Panel.Footer>
        </Panel>;
      </span>
    )
  }
}

export default AboutPlace
