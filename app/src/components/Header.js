import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import logo from '../static/images/HSKAlogo.png';

class Header extends Component {
  render() {
    return(
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand bsSize="large">
            <a href="/">evalDapp
              <img src={logo} className="App-logo" alt="logo" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
        {!this.props.loading
          ? (<Nav>
            {this.props.isOwner
              ? (<NavDropdown eventKey={3} title="Admin Tools" id="basic-nav-dropdown">
                  <MenuItem onClick={this.props.handleRegisterForEvalClick()}>
                    Evaluation registration
                  </MenuItem>
                </NavDropdown>)
              : (<NavDropdown eventKey={3} title="Available Courses" id="basic-nav-dropdown">
                  {this.props.coursesAvailable.map((course) => {
                    return(
                      <MenuItem onClick={this.props.handleCourseClick()}eventKey={course.id.toNumber()} >{course.id.toNumber()}</MenuItem>
                    )
                  })}
                  <MenuItem divider />
                  <MenuItem eventKey={3.4}>Already evaluated</MenuItem>
                </NavDropdown>)
            }
            </Nav>)
          : (<div>Loading...</div>)
          }
          <Navbar.Text>
            <div className="App-title">Signed in as
            <span className="App-account"> {this.props.account}</span>
            </div>
          </Navbar.Text>
          <Nav pullRight>
            <NavItem eventKey={1} href="/stats">
              Show stats
            </NavItem>
            <NavItem eventKey={2} href="/about">
              About
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default Header
