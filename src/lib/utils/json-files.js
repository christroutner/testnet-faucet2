/*
  A utility file for reading and writing JSON files.
*/

'use strict'

const fs = require('fs')

// Writes out a JSON file of any object passed to the function.
// This is used for testing.
function writeJSON (obj, fileName) {
  return new Promise(function (resolve, reject) {
    try {
      const fileStr = JSON.stringify(obj, null, 2)

      fs.writeFile(fileName, fileStr, function (err) {
        if (err) {
          console.error('Error while trying to write file: ', err)
          return reject(err)
        } else {
          // console.log(`${fileName} written successfully!`)
          return resolve()
        }
      })
    } catch (err) {
      console.error('Error trying to write out object in util.js/_writeJSON().', err)
      return reject(err)
    }
  })
}

// Read and parse a JSON file.
function readJSON (fileName) {
  return new Promise(function (resolve, reject) {
    try {
      fs.readFile(fileName, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.log('Admin .json file not found!')
          } else {
            console.log(`err: ${JSON.stringify(err, null, 2)}`)
          }

          return reject(err)
        }

        const obj = JSON.parse(data)

        return resolve(obj)
      })
    } catch (err) {
      console.error('Error trying to read JSON file in util.js/_readJSON().', err)
      return reject(err)
    }
  })
}

module.exports = {
  writeJSON,
  readJSON
}
