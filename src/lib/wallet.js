/*
  wallet.js library using bch-js
*/

'use strict'

let _this

class Wallet {
  constructor () {
    _this = this

    // Open the wallet json file.
    try {
      _this.wallet = require('../../wallet.json')
    } catch (err) {
      throw new Error('Could not open wallet.json file.')
    }
  }

  doSomething () {
    return true
  }
}

module.exports = Wallet
