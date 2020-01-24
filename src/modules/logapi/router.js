// const validator = require('../../middleware/validators')
const LogApi = require('./controller')
const logApi = new LogApi()

module.exports.baseUrl = '/logapi'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [logApi.getLogs]
  }
  /*
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
  */
]
