const assert = require('chai').assert
const axios = require('axios').default

const config = require('../../config')
// const testUtils = require('../utils')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = `http://localhost:${config.port}`

describe('Coins', () => {
  before(async () => {
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)

    // const admin = await adminLib.loginAdmin()
    // console.log(`admin: ${JSON.stringify(admin, null, 2)}`)
  })

  describe('GET /coins/', () => {
    it('should return balance', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/coins/`,
        headers: {
          Accept: 'application/json'
        }
      }
      const result = await axios(options)

      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.property(result.data, 'balance')
      assert.isNumber(result.data.balance)
    })
  })
})
