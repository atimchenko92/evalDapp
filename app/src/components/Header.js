import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import history from '../history'

import logo from '../static/images/HSKAlogo.png';

class Header extends Component {
  render() {
    return(
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand bsSize="large">
            <a className="clickableStyle" onClick={()=>{history.push('/')}}>evalDapp
              <img src={logo} className="App-logo" alt="logo" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
        {!this.props.loading
          ? (<Nav>
            {this.props.isOwner
              ? (<NavDropdown title="Admin Tools" id="basic-nav-dropdown">
                  <MenuItem onSelect={() => this.props.handleRegisterForEvalClick()}>
                    Evaluation registration
                  </MenuItem>
                </NavDropdown>)
              : (<NavDropdown title="Available Courses" id="basic-nav-dropdown">
                  {this.props.coursesAvailable.map((course) => {
                    return(
                      <MenuItem onSelect={k=> this.props.handleCourseClick(k)}
                        eventKey={course.id.toNumber()}>{course.id.toNumber()}
                      </MenuItem>
                    )
                  })}
                  <MenuItem divider />
                    <MenuItem>Already evaluated</MenuItem>
                </NavDropdown>)
            }
            </Nav>)
          : (<div>Loading...</div>)
          }
          <Navbar.Text>
            <span className="App-title">Signed in as
              <span className="App-account"> {this.props.account}</span>
            </span>
          </Navbar.Text>
          <Nav pullRight>
            <NavItem onSelect={()=>{history.push('/stats/')}}>
              Show stats
            </NavItem>
            <NavItem onSelect={()=>{history.push('/about/')}}>
              About
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default Header
