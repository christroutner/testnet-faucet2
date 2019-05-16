const User = require('../models/users')
const config = require('../../config')
const getToken = require('../utils/auth')
const jwt = require('jsonwebtoken')

async function ensureUser (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  return next()
}

// This funciton is almost identical to ensureUser, except at the end, it verifies
// that the 'type' associated with the user equals 'admin'.
async function ensureAdmin (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  if (ctx.state.user.type !== 'admin') {
    ctx.throw(401, 'not admin')
  }

  return next()
}

// This middleware ensures that the :id used in the API endpoint matches the
// the ID used in the JWT, or failing that, the ID used in the JWT matches
// an Admin user. This prevents situations like users updating other users
// profiles or non-admins deleting users.
// TODO Tests must be developed before developing this function.
async function ensureTargetUserOrAdmin (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  // The user ID targeted in this API call.
  const targetId = ctx.params.id
  // console.log(`targetId: ${JSON.stringify(targetId, null, 2)}`)

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  // console.log(`ctx.state.user: ${JSON.stringify(ctx.state.user, null, 2)}`)
  // Ensure the calling user and the target user are the same.
  if (ctx.state.user._id.toString() !== targetId.toString()) {
    console.log(`Calling user and target user do not match!`)
    console.log(`Calling user: ${ctx.state.user._id}`)
    console.log(`Target user: ${targetId}`)

    // If they don't match, then the calling user better be an admin.
    if (ctx.state.user.type !== 'admin') {
      ctx.throw(401, 'not admin')
    } else {
      console.log(`It's ok. The user is an admin.`)
    }
  }

  return next()
}

module.exports = {
  ensureUser,
  ensureAdmin,
  ensureTargetUserOrAdmin
}
