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

  /**
   * @api {get} /coins Get balance of the faucet
   * @apiPermission public
   * @apiName Balance
   * @apiGroup Coins
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5000/coins
   */
  async getBalance (ctx, next) {
    try {
      const balance = await _this.wallet.getBalance()
      // const balance = await _this.wallet.doSomething()

      ctx.body = { balance }
    } catch (err) {
      wlogger.error('Error in coins/controller.js/getBalance(): ', err)
      ctx.throw(500, 'Unhandled error in GET /coins/')
    }

    if (next) return next()
  }

  /**
   * @api {get} /coins/:cashaddr Get testnet tokens
   * @apiPermission public
   * @apiName Get Testnet Coins
   * @apiGroup Coins
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5000/coins/bchtest:qqmd9unmhkpx4pkmr6fkrr8rm6y77vckjvqe8aey35
   *
   */
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
