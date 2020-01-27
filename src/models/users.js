const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const config = require('../../config')
const jwt = require('jsonwebtoken')

const User = new mongoose.Schema({
  type: { type: String, default: 'user' },
  name: { type: String },
  username: { type: String },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (email) {
        // eslint-disable-next-line no-useless-escape
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
      },
      message: props => `${props.value} is not a valid Email format!`
    }

  }
})

User.pre('save', function preSave (next) {
  const user = this

  if (!user.isModified('password')) {
    return next()
  }

  new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reject(err)
      }
      resolve(salt)
    })
  })
    .then(salt => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          throw new Error(err)
        }

        user.password = hash

        next(null)
      })
    })
    .catch(err => next(err))
})

User.methods.validatePassword = function validatePassword (password) {
  const user = this

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return reject(err)
      }

      resolve(isMatch)
    })
  })
}

User.methods.generateToken = function generateToken () {
  const user = this

  const token = jwt.sign({ id: user.id }, config.token)
  // console.log(`config.token: ${config.token}`)
  // console.log(`generated token: ${token}`)
  return token
}

// export default mongoose.model('user', User)
module.exports = mongoose.model('user', User)
