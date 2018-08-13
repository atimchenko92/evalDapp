import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

//Places
import HomePlace from './places/HomePlace'
import CourseEvalPlace from './places/CourseEvalPlace'
import EvalRegisterPlace from './places/EvalRegisterPlace'
import AboutPlace from './places/AboutPlace'
import StatsPlace from './places/StatsPlace'
import DemoToolsPlace from './places/DemoToolsPlace'

class Main extends Component {
  render() {
    return(
      <main>
        <Switch>
          <Route exact path='/' component={HomePlace}/>
          <Route path='/course/:number' component={CourseEvalPlace}/>
          <Route path='/register' component={EvalRegisterPlace}/>
          <Route path='/about' component={AboutPlace}/>
          <Route path='/stats' component={StatsPlace}/>
          <Route path='/demoTools' component={DemoToolsPlace}/>
        </Switch>
      </main>
    );
  }
}

export default Main
