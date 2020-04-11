
const assert = require('chai').assert

const config = require('../../config')
const Wallet = require('../../src/lib/wallet')

let uut

describe('#Wallet', () => {
  beforeEach(() => {
    uut = new Wallet()
  })

  describe('getBalance()', () => {
    it('should get a balance from FullStack.cash', async () => {
      const result = await uut.getBalance()
      // console.log('result: ', result)

      assert.isNumber(result)
    })
  })

  describe('sendBCH()', () => {
    it('should send BCH to itself', async () => {
      const bchAddr = config.appAddress

      const result = await uut.sendBCH(bchAddr)
      // console.log('result: ', result)

      assert.isString(result)
      assert.include(result, '020000000')
    })
  })
})
