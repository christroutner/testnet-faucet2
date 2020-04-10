/*
  Mocha unit tests for the jwt-bch-api.js library.
*/

const assert = require('chai').assert

const FullStack = require('../../src/fullstack')

describe('#fullstack', () => {
  let uut

  beforeEach(() => {
    uut = new FullStack()
  })

  describe('#getApiToken', () => {
    it('should get a free API Token', async () => {
      const testState = {
        login: 'demo@demo.com',
        password: 'demo',
        apiToken: ''
      }

      const result = await uut.getApiToken(testState, true)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
      assert.include(result, 'eyJh')
    })
  })
})
