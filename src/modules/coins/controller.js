/*
  Route handlers for /coin API endpoints.
*/

'use strict'

const config = require('../../../config')
const Wallet = require('../../lib/wallet.js')
const wlogger = require('../../lib/wlogger')

// Instantiate the models.
// const BchAddresses = require('../../models/bch-addresses')
const IpAddresses = require('../../models/ip-addresses')

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
      const now = new Date()
      console.log(' ')
      console.log(
        `${now.toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles'
        })}: Request for coins recieved.`
      )

      // Get the IP of the requester.
      // const ip = ctx.request.ip // Normal usage
      const ip = ctx.request.headers['x-real-ip'] // If behind a reverse proxy

      // The website/host where the request originated.
      const origin = ctx.request.headers.origin

      const bchAddr = ctx.params.bchaddr

      console.log(`Requesting IP: ${ip}, Address: ${bchAddr}, origin: ${origin}`)

      // Allow sending to itself, to test the system. All other addresses use
      // IP and address filtering to prevent abuse of the faucet.
      if (bchAddr !== config.addr) {
        // Check if IP Address already exists in the database.
        const ipIsKnown = await _this.seenIPAddress(ip)
        // const ipIsKnown = false // Used for testing.

        // Check if the BCH address already exists in the database.
        // const bchIsKnown = await checkBchAddress(bchAddr)
        const bchIsKnown = false

        // If either are true, deny request.
        if (ipIsKnown || bchIsKnown) {
          ctx.body = {
            success: false,
            message: 'IP or Address found in database'
          }
          console.log('Rejected due to repeat BCH or IP address.')
          return
        }

        // Reject if the request does not originate from the bitcoin.com website.
        // const goodOrigin = checkOrigin(origin)
        const goodOrigin = true
        if (!goodOrigin) {
          ctx.body = {
            success: false,
            message: 'Request does not originate from bitcoin.com website.'
          }
          console.log('Rejected due to bad origin.')
          return
        }

        // Reject too much BCH is being drained over the course of an hour.
        if (sentTotal > config.bchPerHour) {
          ctx.body = {
            success: false,
            message: 'Too much tBCH being drained. Wait an hour and try again.'
          }
          console.log('Rejected due to too much tBCH being requested.')
          return
        }

        // Reject if IP is in the blacklisted IP range.
        // for (let i = 0; i < blackList.length; i++) {
        //   const elem = blackList[i]
        //
        //   if (ip.indexOf(elem) > -1) {
        //     ctx.body = {
        //       success: false,
        //       message: "IP address has been black listed."
        //     }
        //     console.log(`Rejected due to IP in black list.`)
        //     return
        //   }
        // }
      }

      // Otherwise send the payment.
      const txid = await _this.wallet.sendBCH(bchAddr)
      if (!txid) {
        ctx.body = {
          success: false,
          message: 'Invalid BCH cash address.'
        }
        console.log('Rejected because invalid BCH testnet address.')
        return
      }
    } catch (err) {
      wlogger.error('Error in coins/controller.js/getCoins()')
      ctx.throw(500)
    }

    if (next) return next()
  }

  // Checks if the IP address exists in the DB. Returns true if the IP exists in
  // the database, indicating that it's been seen before. It returns false
  // if the IP address has never been seen before.
  async seenIPAddress (ip) {
    try {
      if (ip === undefined) {
        throw new Error('IP address is not defined')
        // return true
      }

      // Try to find the IP address in the database.
      const existingIp = await IpAddresses.findOne({ ipAddress: ip.toString() })

      if (existingIp) return true

      return false
    } catch (err) {
      console.log('Error in seenIPAddress.')
      throw err
    }
  }
}

module.exports = CoinsController
