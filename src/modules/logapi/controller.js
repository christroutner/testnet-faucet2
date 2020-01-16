const lineReader = require('line-reader')
const fs = require('fs')

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
      console.log('entering getLogs()')

      const password = ctx.request.body.password
      _this.password = password

      if (password === 'test') {
        const now = new Date()
        const thisDate = now.getDate()

        let thisMonth = now.getMonth() + 1
        thisMonth = ('0' + thisMonth).slice(-2)
        // console.log(`thisMonth: ${thisMonth}`)

        const filename = `koa-dev-2020-${thisMonth}-${thisDate}.log`
        // console.log(`filename: ${filename}`)
        const logDir = `${__dirname}/../../../logs/`
        const fullPath = `${logDir}${filename}`
        // console.log(`fullPath: ${fullPath}`)

        // const data = require(`${__dirname}/../../../logs/${filename}`)
        // const data = await this.readFile(filename)
        const data = await _this.readLines(fullPath)
        // console.log(`data: ${JSON.stringify(data, null, 2)}`)

        ctx.body = {
          success: true,
          data
        }
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
        console.log(`unhandled error: `, err)
      }
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
        let i = 0

        lineReader.eachLine(filename, function (line, last) {
          try {
            data.push(JSON.parse(line))

            // Uncomment to display the raw data in each line of the winston log file.
            console.log(`line ${i}: ${line}`)
            i++

            if (last) return resolve(data)
          } catch (err) {
            console.log(`err: `, err)
          }
        })
      } catch (err) {
        console.log(`Error in readLines()`)
        return reject(err)
      }
    })
  }
}

module.exports = LogsApi
