
const assert = require('chai').assert

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
})
