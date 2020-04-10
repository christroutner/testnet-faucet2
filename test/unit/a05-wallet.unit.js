
const assert = require('chai').assert
const sinon = require('sinon')

const Wallet = require('../../src/lib/wallet')

describe('#Wallet', () => {
  let sandbox
  let uut

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    uut = new Wallet()
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
})
