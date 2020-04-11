/*
  Route handlers for /coin API endpoints.
*/

'use strict'

const config = require('../../../config')
const Wallet = require('../../lib/wallet.js')
const wlogger = require('../../lib/wlogger')

// Instantiate the models.
const BchAddresses = require('../../models/bch-addresses')
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
      // x-real-ip = IP if behind a reverse proxy
      // request.ip = local IP
      const ip = ctx.request.headers['x-real-ip'] || ctx.request.ip

      // The website/host where the request originated.
      const origin = ctx.request.headers.origin

      const bchAddr = ctx.params.bchaddr

      console.log(`Requesting IP: ${ip}, Address: ${bchAddr}, origin: ${origin}`)

      // Allow sending to itself, to test the system. All other addresses use
      // IP and address filtering to prevent abuse of the faucet.
      if (bchAddr !== _this.config.appAddress) {
        // Check if IP Address already exists in the database.
        const ipIsKnown = await _this.seenIPAddress(ip)
        // const ipIsKnown = false // Used for testing.

        // Check if the BCH address already exists in the database.
        const bchIsKnown = await _this.checkBchAddress(bchAddr)
        // const bchIsKnown = false

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
        if (sentTotal > _this.config.bchPerHour) {
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
      const hex = await _this.wallet.sendBCH(bchAddr)

      const txid = await _this.wallet.broadcastTx(hex)
      if (!txid) {
        ctx.body = {
          success: false,
          message: 'Invalid BCH cash address.'
        }
        console.log('Rejected because invalid BCH testnet address.')
        return
      }

      // Track the amount of BCH sent.
      sentTotal += config.satsToSend

      // Add IP and BCH address to DB.
      await _this.saveIp(ip)
      await _this.saveAddr(bchAddr)

      ctx.body = {
        success: true,
        txid: txid,
        message: `tBCH sent via TXID: ${txid}`
      }
    } catch (err) {
      wlogger.error('Error in coins/controller.js/getCoins():', err)
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

  // Saves the IP address to the database.
  async saveIp (ip) {
    try {
      const newIp = new IpAddresses()

      newIp.ipAddress = ip

      const now = new Date()
      const timestamp = now.toISOString()
      newIp.timestamp = timestamp

      await newIp.save()
    } catch (err) {
      wlogger.error('Error in saveIp().')
      throw err
    }
  }

  // Saves the BCH address to the database.
  async saveAddr (bchAddr) {
    try {
      const newAddr = new BchAddresses()

      newAddr.bchAddress = bchAddr

      await newAddr.save()
    } catch (err) {
      console.log('Error in saveAddr().')
      throw err
    }
  }

  // Returns false if the request did not orginate from the FullStack.cash website.
  checkOrigin (origin) {
    try {
      if (origin === 'https://faucet.fullstack.cash') return true

      return false
    } catch (err) {
      console.log('Error in checkOrigin.')
      throw err
    }
  }

  // Checks if the BCH address exists in the DB. Returns true or false.
  async checkBchAddress (bchAddr) {
    try {
      const existingAddr = await BchAddresses.findOne({ bchAddress: bchAddr })

      if (existingAddr) return true

      return false
    } catch (err) {
      console.log('Error in checkBchAddress.')
      throw err
    }
  }
}

module.exports = CoinsController
