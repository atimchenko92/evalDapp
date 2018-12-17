/* eslint-disable no-console */
import React, { Component } from 'react'

// Contract/truffle components
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import evaluation_artifacts from '../../contracts/Evaluation.json'

// Child Components
import PhaseIndicator from '../fragments/PhaseIndicator'

class HomePlace extends Component {
  constructor(args) {
    super(args)
    this.state = {
      loading: true,
      account: '0x0',
      isOwner: false,
      timeState: ''
    }

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask')
      // Use Mist/MetaMask's provider
      this.provider = window.web3.currentProvider
    } else {
      console.warn('No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
    }
    window.web3 = new Web3(this.provider)

    this.timeInput = 0

    this.generalInfo = {}

    this.prepareInterval = 0
    this.evalInterval = 0
    this.progTimeLeft = 0
    this.progPercent = 0

    this.evaluation = contract(evaluation_artifacts)
    this.evaluation.setProvider(this.provider)
    this.handleTimeInput = this.handleTimeInput.bind(this)
    this.handleTimeIncrease = this.handleTimeIncrease.bind(this)
    this.handleTimeDecrease = this.handleTimeDecrease.bind(this)
  }

  componentDidMount() {
    var self = this
    window.web3.eth.getCoinbase(function (err, account) {
      if (err != null) {
        alert('There was an error fetching your account.')
        console.log(err)
        return
      }

      if (account == null) {
        alert('Couldn\'t load account! Make sure your Ethereum client is configured correctly.')
        return
      }

      self.setState({ account: account })
      self.evaluation.deployed().then((evalInstance) => {
        self.loadBasicInfo(evalInstance)
      })
    })
  }

  async loadBasicInfo(evalInstance) {

    let contractOwner = await evalInstance.owner()
    if (this.state.account !== contractOwner)
      this.setState({ isOwner: false })
    else
      this.setState({ isOwner: true })

    //Load up things
    let semester = await evalInstance.semester()
    let initTimestamp = await evalInstance.evalInitTimestamp()
    let startTimestamp = await evalInstance.evalStartTimestamp()
    let endTimestamp = await evalInstance.evalEndTimestamp()
    let testNowTime = await evalInstance.testNow()

    var initDate = new Date(initTimestamp * 1000)
    var startDate = new Date(startTimestamp * 1000)
    var endDate = new Date(endTimestamp * 1000)
    var testNowDate = new Date(testNowTime * 1000)

    this.prepareInterval = Math.ceil(
      Math.abs(startDate.getTime() - initDate.getTime()) / (1000 * 3600 * 24))

    this.evalInterval = Math.ceil(
      Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))

    this.generalInfo = {
      semester: semester, initDate: initDate,
      startDate: startDate, endDate: endDate, testNowDate: testNowDate,
      prepareInterval: this.prepareInterval, evalInterval: this.evalInterval
    }

    if (startDate.getTime() - testNowDate.getTime() >= 0) {
      this.progTimeLeft = Math.ceil(
        Math.abs(testNowDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
      this.progPercent = 100 - Math.ceil((this.progTimeLeft * 100) / this.prepareInterval)
      this.setState({ timeState: 'registr', loading: false })
    }
    else if (endDate.getTime() - testNowDate.getTime() >= 0) {
      this.progTimeLeft = Math.ceil(
        Math.abs(testNowDate.getTime() - endDate.getTime()) / (1000 * 3600 * 24))
      this.progPercent = 100 - Math.ceil((this.progTimeLeft * 100) / this.evalInterval)
      this.setState({ timeState: 'eval', loading: false })
    }
    else {
      this.setState({ timeState: 'end', loading: false })
    }
  }

  handleTimeInput(e) {
    this.timeInput = e.target.value
  }

  async handleTimeIncrease() {
    const factor = this.timeInput
    this.evaluation.deployed().then(async (evalInstance) => {
      await evalInstance.increaseNowTime(factor, { from: this.state.account })
    })
  }

  handleTimeDecrease() {
    const factor = this.timeInput
    this.evaluation.deployed().then(async (evalInstance) => {
      await evalInstance.decreaseNowTime(factor, { from: this.state.account })
    })
  }

  render() {
    return (
      <span>
        {!this.state.loading ?
          <PhaseIndicator adminMode={this.state.isOwner}
            timeState={this.state.timeState}
            progPercent={this.progPercent}
            progTimeLeft={this.progTimeLeft}
            generalInfo={this.generalInfo}
            handleTimeInput={this.handleTimeInput.bind(this)}
            handleTimeIncrease={this.handleTimeIncrease.bind(this)}
            handleTimeDecrease={this.handleTimeDecrease.bind(this)} /> :
          <span>Loading...</span>
        }
      </span>
    )
  }
}

export default HomePlace
