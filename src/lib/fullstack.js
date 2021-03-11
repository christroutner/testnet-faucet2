/*
  This library ports the functionality in the jwt-bch-demo for working with
  FullStack.cash.
*/

const config = require('../../config')

const State = require('./state')
const state = new State()

const JwtLib = require('jwt-bch-lib')

// Instantiate bch-js SDK for working with Bitcoin Cash.
const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS({
  restURL: config.APISERVER,
  apiToken: config.BCHJSTOKEN
})

let _this

class FullStack {
  constructor () {
    _this = this

    _this.state = state
    _this.config = config
    _this.jwtLib = new JwtLib(_this.state.currentState)
    _this.bchjs = bchjs
  }

  // This is a one-time function used to initalize the app at startup. It registers
  // with the auth.fullstack.cash server and either gets a new API JWT token or
  // validates the API JWT token is already has, depending on the state of the app.
  async startup () {
    try {
      const stateData = await _this.state.readState()
      console.log(
        `The apps current state: ${JSON.stringify(stateData, null, 2)}`
      )
      console.log(' ')

      let apiToken = ''

      // Ensure the app has a valid API JWT token.
      try {
        apiToken = await _this.getApiToken(stateData, true)
        // console.log(`apiToken: ${JSON.stringify(apiToken, null, 2)}`)

        // Save the state.
        stateData.apiToken = apiToken
        await _this.state.writeState(stateData)

        // Export the api token to the environment variable so that other libraries
        // can grab it.
        process.env.BCHJSTOKEN = apiToken
      } catch (err) {
        console.log('Could not log in to get JWT token. Skipping.')
      }

      // Instantiate bch-js with the API token.
      _this.bchjs = new BCHJS({
        restURL: _this.config.APISERVER,
        apiToken: _this.config.BCHJSTOKEN
      })

      // Start a timer that periodically checks the balance of the app.
      // Also start a timer that runs the main app every 10 seconds.
      // setInterval(function () {
      //   try {
      //     _this.checkBalance()
      //   } catch (err) {
      //     console.log('Error: ', err)
      //   }
      // }, 3000) // 3 seconds

      // Also check the balance immediately.
      // _this.checkBalance()
    } catch (err) {
      console.error('Error in fullstack.js/startup()')
      throw err
    }
  }

  // Check the balance of this apps BCH address.
  async checkBalance () {
    try {
      const address = 'bitcoincash:qr8wlllpll7cgjtav9qt7zuqtj9ldw49jc8evqxf5x'

      // Get the balance for the address from the indexer.
      const balanceObj = await _this.bchjs.Electrumx.balance(address)
      // console.log(`balanceObj: ${JSON.stringify(balanceObj, null, 2)}`)

      // Calculate the real balance.
      const realBalance =
        Number(balanceObj.balance.confirmed) +
        Number(balanceObj.balance.unconfirmed)

      // Generate a timestamp.
      let now = new Date()
      now = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })

      console.log(`Balance: ${realBalance} satoshis at ${now}`)
      console.log(' ')
    } catch (err) {
      console.error('Error in checkBalance(): ', err)
    }
  }

  // Get an API JWT token for use with bch-js.
  // If the there *is no JWT token* saved to the state, a new one will be obtained.
  // If there *is* a JWT token saved to the state, it will be validated.
  // If the saved JWT token is *invalid*, a new one will attempt to be obtained.
  async getApiToken (stateData, verbose = false) {
    try {
      // console.log(`stateData: ${JSON.stringify(stateData, null, 2)}`)

      // Instantiate the jwt-bch-lib library.
      _this.reinitialize(stateData)

      // Login to auth.fullstack.cash.
      await _this.jwtLib.register()

      if (verbose) {
        // Display the details retrieved from the server.
        console.log(
          `jwt-bch-lib user data: ${JSON.stringify(
            _this.jwtLib.userData,
            null,
            2
          )}`
        )
        console.log(' ')
      }

      // Pull out the current API JWT token.
      let apiToken = _this.jwtLib.userData.apiToken
      // const bchAddr = _this.jwtLib.userData.bchAddr

      // If there is no token, attempt to get a new free-tier token.
      if (!apiToken) {
        apiToken = await _this.requestNewToken(_this.config.apiLevel)
        return apiToken
      }

      // Validate the exiting token.
      const isValid = await _this.jwtLib.validateApiToken()
      // console.log(`isValid: ${isValid}`)

      // If the current token is not valid, attempt to request a new one.
      if (!isValid) {
        console.log('Existing API token is not valid. Obtaining a new one.')
        await _this.requestNewToken(_this.config.apiLevel)
      } else {
        console.log('Current API token is valid.')
      }
      console.log(' ')

      // API token exists and is valid. Return it.
      return _this.jwtLib.userData.apiToken
    } catch (err) {
      console.error('Error in fullstack.js/getApiToken()')
      throw err
    }
  }

  // Reinitializes the local instance of the jwt-bch-lib.
  reinitialize (stateData) {
    _this.jwtLib = new JwtLib(stateData)
  }

  // Update the credit for this account, then request a new API token at the
  // apiLevel.
  async requestNewToken (apiLevel) {
    try {
      // Ask the auth server to update the credit for this apps account.
      await _this.jwtLib.updateCredit()

      // Request a new API token
      const result = await _this.jwtLib.getApiToken(apiLevel)

      return result.apiToken
    } catch (err) {
      console.error('Error in fullstack.js/requestNewToken()')
      throw err
    }
  }
}

module.exports = FullStack
