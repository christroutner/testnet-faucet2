// npm libraries
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const convert = require('koa-convert')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const session = require('koa-generic-session')
const passport = require('koa-passport')
const mount = require('koa-mount')
const serve = require('koa-static')
const cors = require('kcors')

// Local libraries
const config = require('../config') // this first.
const adminLib = require('../src/lib/admin')
const errorMiddleware = require('../src/middleware')
const wlogger = require('../src/lib/wlogger')

const FullStack = require('../src/lib/fullstack')
const fullstack = new FullStack()

const IpAddresses = require('../src/models/ip-addresses')

async function startServer () {
  // Create a Koa instance.
  const app = new Koa()
  app.keys = [config.session]

  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )

  // MIDDLEWARE START

  app.use(convert(logger()))
  app.use(bodyParser())
  app.use(session())
  app.use(errorMiddleware())

  // Used to generate the docs.
  app.use(mount('/', serve(`${process.cwd()}/docs`)))

  // Mount the page for displaying logs.
  app.use(mount('/logs', serve(`${process.cwd()}/config/logs`)))

  // User Authentication
  require('../config/passport')
  app.use(passport.initialize())
  app.use(passport.session())

  // Custom Middleware Modules
  const modules = require('../src/modules')
  modules(app)

  // Enable CORS for testing
  // THIS IS A SECURITY RISK. COMMENT OUT FOR PRODUCTION
  app.use(cors({ origin: '*' }))

  // MIDDLEWARE END

  console.log(`Running server in environment: ${config.env}`)
  wlogger.info(`Running server in environment: ${config.env}`)

  await app.listen(config.port)
  console.log(`Server started on ${config.port}`)

  // Create the system admin user.
  const success = await adminLib.createSystemUser()
  if (success) console.log('System admin user created.')

  // Validate the JWT token with FullStack.cash.
  if (config.env !== 'test') {
    fullstack.startup()
  }

  // Periodically clear IPs from the database.
  setInterval(async function () {
    await cleanIPs()
  }, 60000 * 60) // Once per hour
  await cleanIPs() // Clear IPs on startup too.

  return app
}
// startServer()

// Removes IP addresses from the database that are more than 24 hours old.
async function cleanIPs () {
  try {
    const now = new Date()
    const nowNum = now.getTime()
    const oneDay = 60000 * 60 * 24
    const yesterday = new Date(nowNum - oneDay)

    await mongoose.connect(config.database, { useNewUrlParser: true })

    const ipAddrs = await IpAddresses.find({})
    // console.log(`ipAddrs: ${JSON.stringify(ipAddrs, null, 2)}`)

    // Loop through each IP entry.
    for (let i = 0; i < ipAddrs.length; i++) {
      const thisIp = ipAddrs[i].timestamp

      const oldTime = new Date(thisIp.timestamp)

      // If the timestamp on the IP address model is more than 24 hours old,
      // delete it from the database.
      if (oldTime.getTime() < yesterday.getTime()) { await thisIp.remove() }
    }

    mongoose.connection.close()

    wlogger.info('Cleared old IPs from database.')
  } catch (err) {
    wlogger.error('Error in cleanIPs: ', err)
  }
}

// export default app
// module.exports = app
module.exports = {
  startServer
}
