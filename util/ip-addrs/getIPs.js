const mongoose = require('mongoose')

const config = require('../../config')

const IpAddresses = require('../../src/models/ip-addresses')

async function getIPs () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const ipAddrs = await IpAddresses.find({})
  console.log(`ipAddrs: ${JSON.stringify(ipAddrs, null, 2)}`)

  mongoose.connection.close()
}
getIPs()
