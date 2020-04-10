const validator = require('../../middleware/validators')
const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

// export const baseUrl = '/users'
module.exports.baseUrl = '/users'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [controller.createUser]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      validator.ensureUser,
      controller.getUsers
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      validator.ensureUser,
      controller.getUser
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      validator.ensureTargetUserOrAdmin,
      controller.getUser,
      controller.updateUser
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      validator.ensureTargetUserOrAdmin,
      controller.getUser,
      controller.deleteUser
    ]
  }
]
