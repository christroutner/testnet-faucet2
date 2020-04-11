'use strict'

// const ensureUser = require('../../middleware/validators')
const CoinsController = require('./controller')
const coinsController = new CoinsController()

// export const baseUrl = '/users'
module.exports.baseUrl = '/coins'

module.exports.routes = [
  /*
  {
    method: 'POST',
    route: '/',
    handlers: [
      user.createUser
    ]
  },
  */
  {
    method: 'GET',
    route: '/',
    handlers: [
      // ensureUser,
      coinsController.getBalance
    ]
  },
  {
    method: 'GET',
    route: '/:bchaddr',
    handlers: [
      // ensureUser,
      coinsController.getCoins
    ]
  }

  /*
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.updateUser
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.deleteUser
    ]
  }
  */
]
