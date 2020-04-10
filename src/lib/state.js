/*
  This library is used to manage the state of the app. State is managed with
  a JSON file. The file is opened at the start of the app and updated
  periodically as the app runs.

  The primary use of the state is to login to FullStack.cash and validate
  JWT token data.
*/

const fs = require('fs')

const config = require('../../config')

// Create the state object with default values.
const currentState = {
  login: config.FULLSTACKLOGIN,
  password: config.FULLSTACKPASS,
  apiToken: config.BCHJSTOKEN
}

let _this

class State {
  constructor () {
    _this = this

    // Move global variables inside the instance.
    _this.config = config
    _this.currentState = currentState
    _this.fs = fs
  }

  // Read and parse the state JSON file. Create the state.json file if it does not exit.
  readState () {
    return new Promise(function (resolve, reject) {
      try {
        _this.fs.readFile(_this.config.stateFileName, async (err, data) => {
          if (err) {
            if (err.code === 'ENOENT') {
              // console.log(`${_this.config.stateFileName} not found!`)
              console.log('state.json not found, creating it.')
              await _this.writeState(_this.currentState)
              const data = _this.readState()
              // console.log(`data: ${JSON.stringify(data, null, 2)}`)
              return resolve(data)
            } else {
              // console.error(`Error trying to read state: ${JSON.stringify(err, null, 2)}`)
              console.error('Error trying to read state.')
            }

            return reject(err)
          }

          const obj = JSON.parse(data)

          return resolve(obj)
        })
      } catch (err) {
        console.error(
          'Error trying to read JSON state file in state.js/readState().'
        )
        return reject(err)
      }
    })
  }

  // Write state to the state.json file.
  writeState (stateData) {
    return new Promise(function (resolve, reject) {
      try {
        _this.currentState = stateData

        const fileStr = JSON.stringify(_this.currentState, null, 2)

        _this.fs.writeFile(_this.config.stateFileName, fileStr, function (err) {
          if (err) {
            console.error('Error while trying to write state.json file.')
            return reject(err)
          } else {
            // console.log(`${fileName} written successfully!`)
            return resolve(true)
          }
        })
      } catch (err) {
        console.error(
          'Error trying to write out state.json file in state.js/writeState().'
        )
        return reject(err)
      }
    })
  }

  // Deletes the state file, if it exists.
  // This wipes the apps state. Useful for unit tests.
  // Returns true if successful, or throws an error.
  deleteState () {
    return new Promise(function (resolve, reject) {
      try {
        _this.fs.unlink(_this.config.stateFileName, function (err) {
          if (err) {
            // If the file doesn't exist, count that as a success.
            if (err.code === 'ENOENT') {
              // console.log(`err: ${JSON.stringify(err, null, 2)}`)
              return resolve(true)
            } else {
              console.error('Error while trying to delete state.json file.')
              return reject(err)
            }
          }

          return resolve(true)
        })
      } catch (err) {
        console.error(
          'Error trying to delete state.json file in state.js/deleteState().'
        )
        return reject(err)
      }
    })
  }
}

module.exports = State
