const User = require('../../models/users')

let _this
class UserController {
  constructor () {
    _this = this
    this.User = User
  }

  /**
   * @api {post} /users Create a new user
   * @apiPermission user
   * @apiName CreateUser
   * @apiGroup Users
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "user": { "email": "email@format.com", "password": "secretpasas" } }' localhost:5001/users
   *
   * @apiParam {Object} user          User object (required)
   * @apiParam {String} user.email Email.
   * @apiParam {String} user.password Password.
   *
   * @apiSuccess {Object}   users           User object
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type       User type (admin or user)
   * @apiSuccess {String}   users.name      User name
   * @apiSuccess {String}   users.username  User username
   * @apiSuccess {String}   users.email     User email
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": {
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "John Doe"
   *          "email": "email@format.com"
   *       }
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async createUser (ctx) {
    const user = new _this.User(ctx.request.body.user)

    try {
      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (!user.email || typeof user.email !== 'string') {
        throw new Error("Property 'email' must be a string!")
      }

      const isEmail = await _this.validateEmail(user.email)
      if (!isEmail) {
        throw new Error("Property 'email' must be email format!")
      }

      if (!user.password || typeof user.password !== 'string') {
        throw new Error("Property 'password' must be a string!")
      }

      if (user.name && typeof user.name !== 'string') {
        throw new Error("Property 'name' must be a string!")
      }

      // Enforce default value of 'user'
      user.type = 'user'

      await user.save()

      const token = user.generateToken()
      const response = user.toJSON()

      delete response.password

      ctx.body = {
        user: response,
        token
      }
    } catch (err) {
      ctx.throw(422, err.message)
    }
  }

  /**
   * @api {get} /users Get all users
   * @apiPermission user
   * @apiName GetUsers
   * @apiGroup Users
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5000/users
   *
   * @apiSuccess {Object[]} users           Array of user objects
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type       User type (admin or user)
   * @apiSuccess {String}   users.name      User name
   * @apiSuccess {String}   users.username  User username
   * @apiSuccess {String}   users.email     User email
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "users": [{
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "John Doe"
   *          "email": "email@format.com"
   *       }]
   *     }
   *
   * @apiUse TokenError
   */
  async getUsers (ctx) {
    try {
      const users = await _this.User.find({}, '-password')
      ctx.body = { users }
    } catch (error) {
      ctx.throw(404)
    }
  }

  /**
   * @api {get} /users/:id Get user by id
   * @apiPermission user
   * @apiName GetUser
   * @apiGroup Users
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5000/users/56bd1da600a526986cf65c80
   *
   * @apiSuccess {Object}   users           User object
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type       User type (admin or user)
   * @apiSuccess {String}   users.name      User name
   * @apiSuccess {String}   users.username  User username
   * @apiSuccess {String}   users.email     User email
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": {
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "John Doe"
   *          "email": "email@format.com"
   *       }
   *     }
   *
   * @apiUse TokenError
   */
  async getUser (ctx, next) {
    try {
      const user = await _this.User.findById(ctx.params.id, '-password')
      if (!user) {
        ctx.throw(404)
      }

      ctx.body = {
        user
      }
    } catch (err) {
      if (err === 404 || err.name === 'CastError') {
        ctx.throw(404)
      }

      ctx.throw(500)
    }
    if (next) {
      return next()
    }
  }

  /**
   * @api {put} /users/:id Update a user
   * @apiPermission user
   * @apiName UpdateUser
   * @apiGroup Users
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X PUT -d '{ "user": { "name": "Cool new Name" } }' localhost:5000/users/56bd1da600a526986cf65c80
   *
   * @apiParam {Object} user          User object (required)
   * @apiParam {String} user.name     Name.
   * @apiParam {String} user.email Email.
   *
   * @apiSuccess {Object}   users           User object
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type      User type (admin or user)
   * @apiSuccess {String}   users.name      Updated name
   * @apiSuccess {String}   users.username  Updated username
   * @apiSuccess {String}   users.email     Updated email
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": {
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "Cool new name"
   *          "email": "email@format.com"
   *       }
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   *
   * @apiUse TokenError
   */
  async updateUser (ctx) {
    // Values obtain from user request.
    // This variable is intended to validate the properties
    // sent by the client
    const userObj = ctx.request.body.user

    const user = ctx.body.user
    try {
      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (userObj.email && typeof userObj.email !== 'string') {
        throw new Error("Property 'email' must be a string!")
      }
      const isEmail = await _this.validateEmail(user.email)
      if (userObj.email && !isEmail) {
        throw new Error("Property 'email' must be email format!")
      }
      if (userObj.password && typeof userObj.password !== 'string') {
        throw new Error("Property 'password' must be a string!")
      }
      if (userObj.name && typeof userObj.name !== 'string') {
        throw new Error("Property 'name' must be a string!")
      }
      if (userObj.projects && !Array.isArray(userObj.projects)) {
        throw new Error("Property 'projects' must be a Array!")
      }
      // Save a copy of the original user type.
      const userType = user.type

      // If user type property is sent by the client
      if (userObj.type) {
        if (typeof userObj.type !== 'string') {
          throw new Error("Property 'type' must be a string!")
        }
        // TODO: Here we can validate the user types allowed

        // Unless the calling user is an admin, they can not change the user type.
        if (userType !== 'admin') {
          throw new Error("Property 'type' can only be changed by Admin user")
        }
      }

      Object.assign(user, ctx.request.body.user)

      await user.save()

      ctx.body = {
        user
      }
    } catch (error) {
      ctx.throw(422, error.message)
    }
  }

  /**
   * @api {delete} /users/:id Delete a user
   * @apiPermission user
   * @apiName DeleteUser
   * @apiGroup Users
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X DELETE localhost:5000/users/56bd1da600a526986cf65c80
   *
   * @apiSuccess {StatusCode} 200
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true
   *     }
   *
   * @apiUse TokenError
   */
  async deleteUser (ctx) {
    const user = ctx.body.user
    await user.remove()
    ctx.status = 200
    ctx.body = {
      success: true
    }
  }

  // Validate Email Format
  async validateEmail (email) {
    // eslint-disable-next-line no-useless-escape
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true
    }
    return false
  }
}

module.exports = UserController
