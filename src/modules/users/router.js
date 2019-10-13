const validator = require('../../middleware/validators')
const user = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/users'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [user.createUser]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [validator.ensureUser, user.getUsers]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [validator.ensureUser, user.getUser]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [validator.ensureTargetUserOrAdmin, user.getUser, user.updateUser]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [validator.ensureTargetUserOrAdmin, user.getUser, user.deleteUser]
  }
]
