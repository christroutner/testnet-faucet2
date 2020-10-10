// const ensureUser = require('../../midleware/validators')

const ContactController = require('./controller')
const contactController = new ContactController()

// export const baseUrl = '/users'
module.exports.baseUrl = '/contact'

module.exports.routes = [
  {
    method: 'POST',
    route: '/email',
    handlers: [
      contactController.email
    ]
  }
]
