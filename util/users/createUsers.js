const mongoose = require('mongoose')

const config = require('../../config')

const USERNAME = 'test'
const PASSWORD = 'pass'

// Connect to the Mongo Database.
mongoose.Promise = global.Promise

async function addUser () {
  await mongoose.connect(config.database)

  const User = require('../../src/models/users')

  const userData = {
    username: USERNAME,
    password: PASSWORD
  }

  const user = new User(userData)

  // Enforce default value of 'user'
  user.type = 'user'

  await user.save()

  await mongoose.connection.close()

  console.log(`User ${USERNAME} created.`)
}
addUser()

module.exports = {
  addUser
}
