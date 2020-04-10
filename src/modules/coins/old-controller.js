/*
  Controller for the API that controls the wallet.

  TODO:
   - Add a blacklist of IP ranges. IP ranges to consider:
     - 171.253.x.x
*/

'use strict'

// Instantiate the models.
const BchAddresses = require('../../models/bch-addresses')
const IpAddresses = require('../../models/ip-addresses')

const config = require('../../../config')
const wallet = require('../../utils/wallet.js')

// Inspect utility used for debugging.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
  depth: 1
}

// An array of strings used to compare the incoming IP address to. If there is
// a match, then the request is rejected.
// const blackList = ['171.253', '103.199']

// Track the total amount sent within an hour.
let sentTotal = 0
setInterval(function () {
  sentTotal = 0
}, 60000 * 60) // 1 hour

// Return the balance of the wallet.
async function getBalance (ctx, next) {
  try {
    // console.log(`ctx.request.ip: ${ctx.request.ip}`)
    // console.log(`ctx.request.headers: ${util.inspect(ctx.request.headers)}`)

    const balance = await wallet.getBalance()

    ctx.body = { balance }
  } catch (err) {
    console.log('Error in getBalance: ', err)

    if (err === 404 || err.name === 'CastError') ctx.throw(404)

    ctx.throw(500)
  }

  if (next) return next()
}

// Sends coins to the user.
async function getCoins (ctx, next) {
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
    // console.log(`ctx.request.ip: ${ctx.request.ip}`)
    // console.log(`ctx.request.headers: ${util.inspect(ctx.request.headers)}`)

    // The website/host where the request originated.
    const origin = ctx.request.headers.origin

    const bchAddr = ctx.params.bchaddr

    console.log(`Requesting IP: ${ip}, Address: ${bchAddr}, origin: ${origin}`)

    // Allow sending to itself, to test the system. All other addresses use
    // IP and address filtering to prevent abuse of the faucet.
    if (bchAddr !== config.addr) {
      // Check if IP Address already exists in the database.
      // const ipIsKnown = await checkIPAddress(ip)
      const ipIsKnown = false // Used for testing.

      // Check if the BCH address already exists in the database.
      // const bchIsKnown = await checkBchAddress(bchAddr)
      const bchIsKnown = false

      // If either are true, deny request.
      if (ipIsKnown || bchIsKnown) {
        ctx.body = {
          success: false,
          message: 'IP or Address found in DB'
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
    const txid = await wallet.sendBCH(bchAddr)
    if (!txid) {
      ctx.body = {
        success: false,
        message: 'Invalid BCH cash address.'
      }
      console.log('Rejected because invalid BCH testnet address.')
      return
    }

    // Track the amount of BCH sent.
    sentTotal += config.bchToSend

    // Add IP and BCH address to DB.
    await saveIp(ip)
    await saveAddr(bchAddr)

    // Respond with success.
    ctx.body = {
      success: true,
      txid: txid
    }
  } catch (err) {
    console.log('Error in getCoins: ', err)

    if (err === 404 || err.name === 'CastError') ctx.throw(404)

    ctx.throw(500)
  }

  if (next) return next()
}

module.exports = {
  getCoins,
  getBalance
}

// Checks if the IP address exists in the DB. Returns true or false.
async function checkIPAddress (ip) {
  try {
    if (ip === undefined) {
      // throw new Error(`IP address is not defined`)
      return true
    }

    const existingIp = await IpAddresses.findOne({ ipAddress: ip.toString() })

    if (existingIp) return true

    return false
  } catch (err) {
    console.log('Error in checkIPAddress.')
    throw err
  }
}

// Returns false if the request did not orginate from the bitcoin.com website.
function checkOrigin (origin) {
  try {
    if (origin === 'https://developer.bitcoin.com') return true

    return false
  } catch (err) {
    console.log('Error in checkOrigin.')
    throw err
  }
}

// Checks if the BCH address exists in the DB. Returns true or false.
async function checkBchAddress (bchAddr) {
  try {
    const existingAddr = await BchAddresses.findOne({ bchAddress: bchAddr })

    if (existingAddr) return true

    return false
  } catch (err) {
    console.log('Error in checkBchAddress.')
    throw err
  }
}

// Saves the IP address to the database.
async function saveIp (ip) {
  try {
    const newIp = new IpAddresses()

    newIp.ipAddress = ip

    const now = new Date()
    const timestamp = now.toISOString()
    newIp.timestamp = timestamp

    await newIp.save()
  } catch (err) {
    console.log('Error in saveIp().')
    throw err
  }
}

// Saves the BCH address to the database.
async function saveAddr (bchAddr) {
  try {
    const newAddr = new BchAddresses()

    newAddr.bchAddress = bchAddr

    await newAddr.save()
  } catch (err) {
    console.log('Error in saveAddr().')
    throw err
  }
}
