/* eslint-disable no-useless-escape */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const config = require('../../../config')

const NodeMailer = require('../../lib/nodemailer')
const nodemailer = new NodeMailer()

let _this

class Contact {
  constructor () {
    _this = this
    _this.config = config
    _this.nodemailer = nodemailer
  }

  async email (ctx) {
    try {
      const data = ctx.request.body

      const emailObj = data.obj
      // Validate input
      if (!emailObj.email || typeof emailObj.email !== 'string') {
        throw new Error("Property 'email' must be a string!")
      }
      const isEmail = await _this.nodemailer.validateEmail(emailObj.email)

      if (!isEmail) {
        throw new Error("Property 'email' must be email format!")
      }

      if (!emailObj.formMessage || typeof emailObj.formMessage !== 'string') {
        throw new Error("Property 'message' must be a string!")
      }

      if (!emailObj.payloadTitle || typeof emailObj.payloadTitle !== 'string') {
        throw new Error("Property 'payloadTitle' must be a string!")
      }

      // If an email list exists, the email will be sended to that list
      // otherwhise will be sended by default to the variable "_this.config.emailUser"
      let _to = [_this.config.emailUser]

      // Email list is optional
      if (emailObj.emailList) {
        if (
          !Array.isArray(emailObj.emailList) ||
          !emailObj.emailList.length > 0
        ) {
          throw new Error("Property 'emailList' must be a array of emails!")
        } else {
          _to = emailObj.emailList
        }
      }

      console.log(`Trying send message to : ${_to}`)

      emailObj.subject = 'Someone wants to share a document with you.'
      emailObj.to = _to

      await _this.nodemailer.sendEmail(emailObj)

      ctx.body = {
        success: true
      }
    } catch (err) {
      ctx.body = {
        success: false
      }
      // console.error(`Error: `, err)
      throw err
    }
  }
}
module.exports = Contact
