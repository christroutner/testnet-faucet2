/*
  Utility app to wipe the test database.
*/

'use strict'

const mongoose = require('mongoose')

// Force test environment
process.env.KOA_ENV = 'test'
const config = require('../config')

async function cleanDb () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  console.log(`mongoose.connection.collections: ${JSON.stringify(mongoose.connection.collections, null, 2)}`)

  for (const collection in mongoose.connection.collections) {
    const collections = mongoose.connection.collections
    if (collections.collection) {
      // const thisCollection = mongoose.connection.collections[collection]
      // console.log(`thisCollection: ${JSON.stringify(thisCollection, null, 2)}`)

      await collection.deleteMany()
    }
  }

  mongoose.connection.close()
}
cleanDb()
