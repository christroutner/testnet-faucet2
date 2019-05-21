const mongoose = require('mongoose')

// Force test environment
process.env.KOA_ENV = 'test'
const config = require('../../config')

const User = require('../../src/models/users')

async function deleteUsers () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  // Get all the users in the DB.
  const users = await User.find({}, '-password')
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  // Delete each user.
  for (let i = 0; i < users.length; i++) {
    const thisUser = users[i]
    await thisUser.remove()
  }

  mongoose.connection.close()
}
deleteUsers()
