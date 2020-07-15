const assert = require('chai').assert

const NodeMailer = require('../src/lib/nodemailer')
const nodemailer = new NodeMailer()

describe('NodeMailer', () => {
  describe('sendEmail()', () => {
    it('should throw error if email property is not provided', async () => {
      try {
        const data = {
          formMessage: 'test msg',
          name: 'test name',
          subject: 'test subject',
          to: ['test2@email.com']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'email\' must be a string!')
      }
    })
    it('should throw error if email property is wrong format', async () => {
      try {
        const data = {
          email: 'test',
          formMessage: 'test msg',
          name: 'test name',
          subject: 'test subject',
          to: ['test2@email.com']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'email\' must be email format!')
      }
    })
    it('should throw error if formMessage property is not provided', async () => {
      try {
        const data = {
          email: 'test@email.com',
          name: 'test name',
          subject: 'test subject',
          to: ['test2@email.com']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'message\' must be a string!')
      }
    })
    it('should throw error if <to> property is not provided', async () => {
      try {
        const data = {
          email: 'test@email.com',
          name: 'test name',
          subject: 'test subject'
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'to\' must be a array!')
      }
    })

    it('should throw error if  <to> is wrong format', async () => {
      try {
        const data = {
          email: 'test@email.com',
          formMessage: 'test msg',
          name: 'test name',
          subject: 'test subject',
          to: ['test']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Array must contain emails format!')
      }
    })

    it('should throw error if subject Property is not provided', async () => {
      try {
        const data = {
          email: 'test@email.com',
          formMessage: 'test msg',
          name: 'test name',
          to: ['test2@email.com']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'subject\' must be a string!')
      }
    })
    it('should throw error if payloadTitle property is not provided', async () => {
      try {
        const data = {
          email: 'test@email.com',
          formMessage: 'test msg',
          name: 'test name',
          subject: 'test subject',
          to: ['test2@email.com']
        }
        await nodemailer.sendEmail(data)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'payloadTitle\' must be a string!')
      }
    })

    /*         it('should send email', async () => {
            try {
                const data = {
                    email: 'test@email.com',
                    formMessage: 'test msg',
                    name: 'test name',
                    to: 'test2@email.com',
                    subject: 'test subject',
                    payloadTitle: 'test title'
                }
                await nodemailer.sendEmail(data)
                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(err.message, 'Property \'subject\' must be a string!')
            }
        }) */
  })
  describe('validateEmailArray()', () => {
    it('should throw error if email list is not provided ', async () => {
      try {
        await nodemailer.validateEmailArray()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'emailList\' must be a array!')
      }
    })
    it('should throw error if email list is empty', async () => {
      try {
        const emailList = []
        await nodemailer.validateEmailArray(emailList)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Property \'emailList\' cant be empty!')
      }
    })
    it('should throw error if email list contain wrong format', async () => {
      try {
        const emailList = [
          'wrongEmail',
          'bad format'
        ]
        await nodemailer.validateEmailArray(emailList)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Array must contain emails format!')
      }
    })
    it('should return true if email list contain email format', async () => {
      try {
        const emailList = [
          'test@email.com',
          'simple@email.com'
        ]
        const result = await nodemailer.validateEmailArray(emailList)
        assert.isTrue(result)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
})
