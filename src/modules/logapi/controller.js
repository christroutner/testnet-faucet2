const lineReader = require('line-reader')
const fs = require('fs')

const config = require('../../../config')

let _this

class LogsApi {
  constructor () {
    _this = this
  }

  /**
   * @api {post} /logapi Parse and return the log files.
   * @apiPermission public
   * @apiName LogApi
   * @apiGroup Logs
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "password": "secretpasas" }' localhost:5000/logapi
   *
   * @apiParam {String} password Password (required)
   *
   * @apiSuccess {Array}   users           User object
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type       User type (admin or user)
   * @apiSuccess {String}   users.name      User name
   * @apiSuccess {String}   users.username  User username
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": {
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "John Doe"
   *          "username": "johndoe"
   *       }
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getLogs (ctx) {
    try {
      // console.log('entering getLogs()')

      // Get the user-provided password.
      const password = ctx.request.body.password
      _this.password = password
      // console.log(`password: ${password}`)

      // Password matches the password set in the config file.
      if (password === config.logPass) {
        // Generate the full path and file name for the current log file.
        const fullPath = _this.generateFileName()

        // Read in the data from the log file.
        const data = await _this.readLines(fullPath)
        // console.log(`data: ${JSON.stringify(data, null, 2)}`)

        // Filter the logs before passing them to the front end.
        const filteredData = _this.filterLogs(data)

        ctx.body = {
          success: true,
          data: filteredData
        }

        // Password does not match password in config file.
      } else {
        ctx.body = {
          success: false
        }
      }
    } catch (err) {
      if (err) {
        ctx.throw(500, err.message)
      } else {
        ctx.throw(500, 'Unhandled error')
        console.log('unhandled error: ', err)
      }
    }
  }

  // Sorts the log data by their timestamp. Returns the LIMIT or less elements.
  filterLogs (data) {
    try {
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)

      const LIMIT = 100 // Max number of entries to return.

      // Sort the elements by date.
      data.sort(function (a, b) {
        let dateA = new Date(a.timestamp)
        dateA = dateA.getTime()

        let dateB = new Date(b.timestamp)
        dateB = dateB.getTime()

        return dateB - dateA
      })

      // Limit the number of elements.
      if (data.length > LIMIT) {
        return data.slice(0, LIMIT)
      }

      // else
      return data
    } catch (err) {
      console.error('Error in logapi/controller.js/filterLogs()')
      throw err
    }
  }

  generateFileName () {
    try {
      const now = new Date()
      const thisDate = now.getDate()

      let thisMonth = now.getMonth() + 1
      thisMonth = ('0' + thisMonth).slice(-2)
      // console.log(`thisMonth: ${thisMonth}`)

      const thisYear = now.getFullYear()

      const filename = `koa-${config.env}-${thisYear}-${thisMonth}-${thisDate}.log`
      // console.log(`filename: ${filename}`)
      const logDir = `${__dirname}/../../../logs/`
      const fullPath = `${logDir}${filename}`
      // console.log(`fullPath: ${fullPath}`)

      return fullPath
    } catch (err) {
      console.error('Error in logapi/controller.js/generateFileName()')
      throw err
    }
  }

  // Promise based read-file
  readFile (path, opts = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.readFile(path, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  // Returns an array with each element containing a line of the file.
  readLines (filename) {
    return new Promise((resolve, reject) => {
      try {
        const data = []
        // let i = 0

        lineReader.eachLine(filename, function (line, last) {
          try {
            data.push(JSON.parse(line))

            // Uncomment to display the raw data in each line of the winston log file.
            // console.log(`line ${i}: ${line}`)
            // i++

            if (last) return resolve(data)
          } catch (err) {
            console.log('err: ', err)
          }
        })
      } catch (err) {
        console.log('Error in readLines()')
        return reject(err)
      }
    })
  }
}

module.exports = LogsApi
