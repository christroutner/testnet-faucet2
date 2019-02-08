const mongoose = require('mongoose')

const config = require('../config')

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database, () => {
  // mongoose.connection.db.dropDatabase()
})

console.log(`config: ${JSON.stringify(config, null, 2)}`)

/*
// Wipe the DB.
function cleanDb () {
  for (const collection in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(collection)) {
      mongoose.connection.collections[collection].remove()
    }
  }
  console.log(`Database wiped.`)
}
cleanDb()
*/

mongoose.connection.close()

console.log(`
Here's how to wipe the db:
1. mongo
2. use p2pvps-server-dev
3. db.dropDatabase()
4. exit
`)
