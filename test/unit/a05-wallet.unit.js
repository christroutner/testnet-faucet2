
const assert = require('chai').assert
const sinon = require('sinon')

const Wallet = require('../../src/lib/wallet')

const mockData = require('../mocks/wallet.mocks')

describe('#Wallet', () => {
  let sandbox
  let uut

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    uut = new Wallet()

    uut.wallet = mockData.testWallet
  })

  afterEach(() => sandbox.restore())

  describe('getBalance()', () => {
    it('should get a balance in satoshis', async () => {
      const mockBalance = 54321

      // Mock returned data from Blockbook. Balances will be strings.
      sandbox.stub(uut.bchjs.Blockbook, 'balance').resolves({
        balance: `${mockBalance}`,
        unconfirmedBalance: '0'
      })

      const result = await uut.getBalance()
      // console.log('result: ', result)

      assert.isNumber(result, true)
      assert.equal(result, mockBalance)
    })
  })

  describe('validateAddress', () => {
    it('should return true for a valid cash address', () => {
      const addr = 'bchtest:qqmd9unmhkpx4pkmr6fkrr8rm6y77vckjvqe8aey35'

      const result = uut.validateAddress(addr)

      assert.equal(true, result)
    })

    it('should return true for a valid legacy address', () => {
      const addr = 'mkWqVHGbfpznuu3JpPoXfCnHrhoekJLUGu'

      const result = uut.validateAddress(addr)

      assert.equal(true, result)
    })

    it('should return false for an invalid address', () => {
      const addr = 'abc123'

      const result = uut.validateAddress(addr)

      assert.equal(false, result)
    })
  })

  describe('findBiggestUtxo()', () => {
    it('should find the biggest UTXO', () => {
      const result = uut.findBiggestUtxo(mockData.utxos)

      assert.equal(result.satoshis, mockData.biggestUtxo.satoshis)
    })
  })

  describe('sendBCH()', () => {
    it('should sendBCH', async () => {
      // Mock dependent functions to prevent live network calls.
      sandbox.stub(uut.bchjs.Blockbook, 'utxo').resolves(mockData.utxos)

      const addr = 'bchtest:qqmd9unmhkpx4pkmr6fkrr8rm6y77vckjvqe8aey35'

      const result = await uut.sendBCH(addr)
      // console.log('result: ', result)

      assert.isString(result)
      assert.include(result, '0200000001c92')
    })
  })
})
