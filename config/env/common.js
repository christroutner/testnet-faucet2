/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 5001,
  logPass: 'test',
  emailServer: process.env.EMAILSERVER ? process.env.EMAILSERVER : 'mail.launchpadip.net',
  emailUser: process.env.EMAILUSER ? process.env.EMAILUSER : 'noreply@launchpadip.net',
  emailPassword: process.env.EMAILPASS ? process.env.EMAILPASS : 'testtest'
}
