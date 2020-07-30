const config = require('../config')
const axios = require('axios').default
const assert = require('chai').assert

// Mock data
// const mockData = require('./mocks/contact-mocks')

const LOCALHOST = `http://localhost:${config.port}`

describe('Contact', () => {
  describe('POST /contact/email', () => {
    it('should throw error if email property is not provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/contact/email`,
          data: {
            obj: {
              formMessage: 'message'
            }
          }
        }

        await axios(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 500)
        assert.include(err.response.data, "Property 'email' must be a string!")
      }
    })
    it('should throw error if email property is wrong format', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/contact/email`,
          data: {
            obj: {
              email: 'email',
              formMessage: 'test message'
            }
          }
        }

        await axios(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 500)
        assert.include(
          err.response.data,
          "Property 'email' must be email format!"
        )
      }
    })
    it('should throw error if formMessage property is not provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/contact/email`,
          data: {
            obj: {
              email: 'email@email.com'
            }
          }
        }

        await axios(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 500)
        assert.include(
          err.response.data,
          "Property 'message' must be a string!"
        )
      }
    })
    it('should throw error if payloadTitle property is not provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/contact/email`,
          data: {
            obj: {
              email: 'email@email.com',
              formMessage: 'test message'
            }
          }
        }

        await axios(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 500)
        assert.include(
          err.response.data,
          "Property 'payloadTitle' must be a string!"
        )
      }
    })
    /* I presented problems here trying to use sandbox in this test */
    /*     it('should send email with  all input', async () => {
      // Mock live network calls.
      sandbox.stub(
        contactController.transporter, 'sendMail')
        .resolves(mockData)
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/contact/email`,
          data: {
            obj: {
              email: 'email@email.com',
              formMessage: 'test email',
              name: 'test name',
              payloadtitle: 'test title'
            }
          }
        }
        const result = await axios(options)
        console.log('RESULT', result.data)
      } catch (err) {
        // console.log(err)
        assert(false, 'Unexpected result')
      }
    }) */
  })
})
