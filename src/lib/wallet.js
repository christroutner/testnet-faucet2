/*
  wallet.js library using bch-js
*/

'use strict'

const config = require('../../config')
const State = require('./state')
const wlogger = require('./wlogger')

const BCHJS = require('@psf/bch-js')

let _this

class Wallet {
  constructor () {
    _this = this

    // Open the wallet json file.
    try {
      _this = this

      _this.config = config

      // Open the wallet. If running a test, open the mock wallet.
      if (_this.config.env !== 'test') {
        _this.WALLETPATH = '../../wallet.json'
        _this.wallet = require(_this.WALLETPATH)
      } else {
        const mockData = require('../../test/mocks/wallet.mocks')
        _this.wallet = mockData.testWallet
      }

      _this.state = new State()
      _this.bchjs = new BCHJS({ restURL: 'https://tapi.fullstack.cash/v3/' })
    } catch (err) {
      throw new Error('Could not open wallet.json file.')
    }
  }

  async getBalance () {
    try {
      const cashAddr = _this.wallet.cashAddress

      const balanceObj = await _this.bchjs.Electrumx.balance(cashAddr)
      // console.log(`balanceObj: ${JSON.stringify(balanceObj, null, 2)}`)

      const balance =
        Number(balanceObj.balance.confirmed) + Number(balanceObj.balance.unconfirmed)
      // console.log(`balance: ${JSON.stringify(balance, null, 2)}`)

      // console.log(`BCH Balance information for ${cashAddress}:`)
      console.log(`Address ${cashAddr} has a balance of ${balance} satoshis`)
      return balance
    } catch (err) {
      console.log('Error in util/wallet.js/getBalance()')
      throw err
    }
  }

  // Send BCH to an address
  // This function returns a hex string of a transaction, ready to be broadcast
  // to the network.
  async sendBCH (bchAddr) {
    try {
      // Exit if not a valid cash address.
      const isValid = _this.validateAddress(bchAddr)
      if (!isValid) return false

      // Amount to send in satoshis
      const AMOUNT_TO_SEND = _this.config.satsToSend

      const mnemonic = _this.wallet.mnemonic

      // root seed buffer
      const rootSeed = await _this.bchjs.Mnemonic.toSeed(mnemonic)

      // master HDNode
      const masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = _this.bchjs.HDNode.derivePath(
        masterHDNode,
        "m/44'/145'/0'"
      )

      const change = _this.bchjs.HDNode.derivePath(account, '0/0')

      const cashAddress = _this.wallet.cashAddress

      // Query utxos associated with the address from an indexer.
      // const utxos = await _this.bchjs.Blockbook.utxo(cashAddress)
      const fulcrumUtxos = await _this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = fulcrumUtxos.utxos
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      // Get the biggest UTXO, which is assumed to be spendable.
      const utxo = _this.findBiggestUtxo(utxos)
      // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

      // instance of transaction builder
      const transactionBuilder = new _this.bchjs.TransactionBuilder('testnet')

      const satoshisToSend = AMOUNT_TO_SEND
      const originalAmount = utxo.satoshis
      // console.log(`originalAmount ${originalAmount}`)

      const vout = utxo.vout
      const txid = utxo.txid

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // get byte count to calculate fee. paying 1 sat/byte
      const byteCount = _this.bchjs.BitcoinCash.getByteCount(
        { P2PKH: 1 },
        { P2PKH: 2 }
      )

      // Calculate the TX fee.
      const satoshisPerByte = 1
      const txFee = Math.floor(satoshisPerByte * byteCount)
      // console.log(`txFee: ${txFee}`)

      // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
      const remainder = originalAmount - satoshisToSend - txFee
      // console.log(`remainder: ${remainder}`)

      // add output w/ address and amount to send
      transactionBuilder.addOutput(_this.wallet.legacyAddress, remainder)
      transactionBuilder.addOutput(
        _this.bchjs.Address.toLegacyAddress(bchAddr),
        satoshisToSend
      )

      // Generate a keypair from the change address.
      const keyPair = _this.bchjs.HDNode.toKeyPair(change)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()

      return hex
    } catch (err) {
      console.log('Error in wallet.sendBCH().')
      throw err
    }
  }

  // Broadcast a hex string to the network.
  async broadcastTx (hex) {
    try {
      // sendRawTransaction to running BCH node
      const txid = await _this.bchjs.RawTransactions.sendRawTransaction(hex)
      console.log(`Sending BCH. Transaction ID: ${txid}`)

      return txid
    } catch (err) {
      wlogger.error('Error in wallet.js/broadcastTx()')
      throw err
    }
  }

  // Returns the utxo with the biggest balance from an array of utxos.
  findBiggestUtxo (utxos) {
    try {
      let largestAmount = 0
      let largestIndex = 0

      for (var i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]

        if (thisUtxo.satoshis > largestAmount) {
          largestAmount = thisUtxo.satoshis
          largestIndex = i
        }
      }

      return utxos[largestIndex]
    } catch (err) {
      _this.wlogger.error('Error in wallet.js/findBiggestUtxo().')
      throw err
    }
  }

  // Returns true if BCH address is valid, false otherwise.
  validateAddress (bchAddr) {
    try {
      const isCashAddress = _this.bchjs.Address.isCashAddress(bchAddr)
      const isTestnetAddress = _this.bchjs.Address.isTestnetAddress(bchAddr)

      if (isCashAddress && isTestnetAddress) {
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }
}

module.exports = Wallet
