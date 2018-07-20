import React, { Component } from 'react'

// UI-Components
import { FormGroup, FormControl, ControlLabel, Radio, Pager} from 'react-bootstrap'

class QuestionContainer extends Component {
  render() {
    return(
        <span>
          <span>{this.props.qInfo.qText}</span>
          {!this.props.qInfo.isTextual ?
            <FormGroup>
              {this.props.qInfo.answers.map((ans) => {
                return(
                  <span>
                    <Radio name="qRadio" inline>
                      {ans.text === "" ? ans.id : ans.text}
                    </Radio>{' '}
                  </span>
                )})
              }
            </FormGroup>
            :
            <FormGroup controlId="formControlsTextarea">
              <ControlLabel>Give your opinion</ControlLabel>
              <FormControl componentClass="textarea" placeholder="Max. 128 characters" />
            </FormGroup>
          }

          <Pager>
            <Pager.Item disabled={this.props.qInfo.isFirst ? true : false }
             onSelect={k=> this.props.handlePagerClick(k)}
             eventKey={'prev'}>Previous</Pager.Item>
            <Pager.Item disabled={this.props.qInfo.isLast ? true : false }
             onSelect={k=> this.props.handlePagerClick(k)}
             eventKey={'next'}>Next</Pager.Item>
          </Pager>
        </span>
    );
  }
}

export default QuestionContainer
