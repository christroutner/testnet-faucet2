const mongoose = require('mongoose')
const config = require('../config')
const axios = require('axios').default

const LOCALHOST = `http://localhost:${config.port}`

// Remove all collections from the DB.
async function cleanDb () {
  for (const collection in mongoose.connection.collections) {
    const collections = mongoose.connection.collections
    if (collections.collection) {
      // const thisCollection = mongoose.connection.collections[collection]
      // console.log(`thisCollection: ${JSON.stringify(thisCollection, null, 2)}`)

      await collection.deleteMany()
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
      url: `${LOCALHOST}/users`,
      data: {
        user: {
          email: userObj.email,
          password: userObj.password
        }
      }
    }

    const result = await axios(options)

    const retObj = {
      user: result.data.user,
      token: result.data.token
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
      url: `${LOCALHOST}/auth`,
      data: {
        email: 'test@test.com',
        password: 'pass'
      }
    }

    const result = await axios(options)

    // console.log(`result: ${JSON.stringify(result.data, null, 2)}`)

    const retObj = {
      token: result.data.token,
      user: result.data.user.username,
      id: result.data.user._id.toString()
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
      url: `${LOCALHOST}/auth`,
      data: {
        email: adminUserData.email,
        password: adminUserData.password
      }
    }

    const result = await axios(options)

    // console.log(`result: ${JSON.stringify(result.data, null, 2)}`)

    const retObj = {
      token: result.data.token,
      user: result.data.user.username,
      id: result.data.user._id.toString()
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
