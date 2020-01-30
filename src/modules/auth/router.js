// import * as auth from './controller'
const CONTROLLER = require('./controller')
const controller = new CONTROLLER()
// export const baseUrl = '/auth'
module.exports.baseUrl = '/auth'

// export default [
module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [controller.authUser]
  }
]
