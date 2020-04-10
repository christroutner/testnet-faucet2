/*
  Route handlers for /coin API endpoints.
*/

'use strict'

const config = require('../../../config')
const Wallet = require('../../lib/wallet.js')
const wlogger = require('../../lib/wlogger')

// Instantiate the models.
// const BchAddresses = require('../../models/bch-addresses')
// const IpAddr
// esses = require('../../models/ip-addresses')

let _this

// Track the total amount sent within an hour.
let sentTotal = 0
setInterval(function () {
  sentTotal = 0
}, 60000 * 60) // 1 hour

class CoinsController {
  constructor () {
    _this = this

    _this.config = config
    _this.wallet = new Wallet()
  }

  async getBalance (ctx, next) {
    try {
      ctx.body = { msg: 'hello' }
    } catch (err) {
      wlogger.error('Error in coins/controller.js/getBalance()')
      ctx.throw(500)
    }

    if (next) return next()
  }

  async getCoins (ctx, next) {
    try {
      ctx.body = { msg: 'hello' }
    } catch (err) {
      wlogger.error('Error in coins/controller.js/getCoins()')
      ctx.throw(500)
    }

    if (next) return next()
  }
}

module.exports = CoinsController
