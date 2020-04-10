const mongoose = require('mongoose')

const ipAddressModel = new mongoose.Schema({
  ipAddress: { type: String },
  timestamp: { type: String }
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('ipAddressModel', ipAddressModel)
