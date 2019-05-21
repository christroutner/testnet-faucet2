const app = require('../bin/server')
const utils = require('./utils')
const config = require('../config')
const rp = require('request-promise')
const assert = require('chai').assert

// const request = supertest.agent(app.listen())
const context = {}

const LOCALHOST = `http://localhost:${config.port}`

describe('Auth', () => {
  before(async () => {
    // await utils.cleanDb() // This should be first instruction.

    await app.startServer() // This should be second instruction.

    const userObj = {
      username: 'test',
      password: 'pass'
    }
    const testUser = await utils.createUser(userObj)

    context.user = testUser.user
    context.token = testUser.token
  })

  describe('POST /auth', () => {
    it('should throw 401 if credentials are incorrect', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/auth`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            username: 'test',
            password: 'wrongpassword'
          }
        }

        let result = await rp(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should auth user', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/auth`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            username: 'test',
            password: 'pass'
          }
        }

        let result = await rp(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(
          result.body.user.username === 'test',
          'Username of test expected'
        )
        assert(
          result.body.user.password === undefined,
          'Password expected to be omited'
        )
      } catch (err) {
        console.log(
          'Error authenticating test user: ' + JSON.stringify(err, null, 2)
        )
        throw err
      }
    })
  })
})
