const mongoose = require('mongoose')
const rp = require('request-promise')
const config = require('../config')

const LOCALHOST = `http://localhost:${config.port}`

// Remove all collections from the DB.
async function cleanDb () {
  for (const collection in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(collection)) {
      await mongoose.connection.collections[collection].deleteMany()
    }
  }
}

// This function is used to create new users.
// userObj = {
//   username,
//   password
// }
async function createUser (userObj) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/users`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        user: {
          username: userObj.username,
          password: userObj.password
        }
      }
    }

    let result = await rp(options)

    const retObj = {
      user: result.body.user,
      token: result.body.token
    }

    return retObj
  } catch (err) {
    console.log('Error in utils.js/createUser(): ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function loginTestUser () {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/auth`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        username: 'test',
        password: 'pass'
      }
    }

    let result = await rp(options)

    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    const retObj = {
      token: result.body.token,
      user: result.body.user.username,
      id: result.body.user._id.toString()
    }

    return retObj
  } catch (err) {
    console.log('Error authenticating test user: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function loginAdminUser () {
  try {
    const FILENAME = `../config/system-user-${config.env}.json`
    const adminUserData = require(FILENAME)
    console.log(`adminUserData: ${JSON.stringify(adminUserData, null, 2)}`)

    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/auth`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        username: adminUserData.username,
        password: adminUserData.password
      }
    }

    let result = await rp(options)

    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    const retObj = {
      token: result.body.token,
      user: result.body.user.username,
      id: result.body.user._id.toString()
    }

    return retObj
  } catch (err) {
    console.log('Error authenticating test admin user: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

// Retrieve the admin user JWT token from the JSON file it's saved at.
async function getAdminJWT () {
  try {
    // process.env.KOA_ENV = process.env.KOA_ENV || 'dev'
    // console.log(`env: ${process.env.KOA_ENV}`)

    const FILENAME = `../config/system-user-${config.env}.json`
    const adminUserData = require(FILENAME)
    // console.log(`adminUserData: ${JSON.stringify(adminUserData, null, 2)}`)

    return adminUserData.token
  } catch (err) {
    console.error('Error in test/utils.js/getAdminJWT()')
    throw err
  }
}

module.exports = {
  cleanDb,
  createUser,
  loginTestUser,
  loginAdminUser,
  getAdminJWT
}
