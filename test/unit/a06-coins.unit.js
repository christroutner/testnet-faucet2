// const assert = require('chai').assert
const assert = require('chai').assert
const sinon = require('sinon')

// const config = require('../../config')
// const testUtils = require('../utils')

const CoinsController = require('../../src/modules/coins/controller')

describe('Coins', () => {
  let sandbox
  let uut

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    uut = new CoinsController()
  })

  describe('GET /coins/', () => {
    it('should return balance', async () => {
      const mockBalance = 54321
      sandbox.stub(uut.wallet, 'getBalance').resolves(mockBalance)

      const ctx = {}
      await uut.getBalance(ctx)

      // console.log(`ctx: ${JSON.stringify(ctx, null, 2)}`)

      assert.property(ctx, 'body')
      assert.property(ctx.body, 'balance')
      assert.equal(ctx.body.balance, mockBalance)
    })
  })
})
