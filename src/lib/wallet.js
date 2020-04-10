/*
  wallet.js library using bch-js
*/

'use strict'

const config = require('../../config')
const State = require('./state')

const BCHJS = require('@chris.troutner/bch-js')

let _this

class Wallet {
  constructor () {
    _this = this

    // Open the wallet json file.
    try {
      _this = this

      _this.config = config
      _this.WALLETPATH = '../../wallet.json'
      _this.wallet = require(_this.WALLETPATH)
      _this.state = new State()
      _this.bchjs = new BCHJS({ restURL: 'https://tapi.fullstack.cash/v3/' })
    } catch (err) {
      throw new Error('Could not open wallet.json file.')
    }
  }

  doSomething () {
    return true
  }

  async getBalance () {
    try {
      const cashAddr = _this.wallet.cashAddress

      const balanceObj = await _this.bchjs.Blockbook.balance(cashAddr)
      // console.log(`balanceObj: ${JSON.stringify(balanceObj, null, 2)}`)

      const balance = Number(balanceObj.balance) + Number(balanceObj.unconfirmedBalance)
      // console.log(`balance: ${JSON.stringify(balance, null, 2)}`)

      // console.log(`BCH Balance information for ${cashAddress}:`)
      console.log(`Address ${cashAddr} has a balance of ${balance} satoshis`)
      return balance
    } catch (err) {
      console.log('Error in util/wallet.js/getBalance()')
      throw err
    }
  }
}

module.exports = Wallet
