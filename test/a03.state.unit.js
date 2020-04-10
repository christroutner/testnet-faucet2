/*
  Mocha unit tests for the state library.
*/

const assert = require('chai').assert
const sinon = require('sinon')

// const mockData = require('./mocks/jwt-bch-api.mocks')

// const config = {
//   login: 'test@test.com',
//   password: 'test'
// }

const State = require('../src/lib/state')

describe('#state.js', () => {
  let sandbox
  let uut

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    uut = new State()
  })

  afterEach(() => sandbox.restore())

  after(async () => {
    // Delete the state after tests.
    uut.deleteState()
  })

  describe('#constructor', () => {
    it('should create a new instance', () => {
      assert.property(uut, 'config')
      assert.property(uut, 'currentState')
    })
  })

  describe('#deleteState', () => {
    it('should delete a state file when it exists', async () => {
      // Ensure the state file exists by calling writeState() first.
      await uut.writeState({})

      // Delete the file.
      const result = await uut.deleteState()

      assert.equal(result, true, 'deleteState() should return success.')
    })

    it('should return success if the state file does not exist', async () => {
      // Assumes this test is run second, to ensure the state.json file has
      // already been deleted.

      // Attempt to delete the non-existant file.
      const result = await uut.deleteState()

      assert.equal(result, true, 'deleteState() should return success.')
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox.stub(uut.fs, 'unlink').throws({
          errno: -2,
          code: 'RANDOM',
          syscall: 'unlink',
          path: 'state.json'
        })

        await uut.deleteState()
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.code, 'RANDOM')
      }
    })

    it('should catch and throw file system errors', async () => {
      try {
        sandbox.stub(uut.fs, 'unlink').yields({
          errno: -2,
          code: 'RANDOM',
          syscall: 'unlink',
          path: 'state.json'
        })

        await uut.deleteState()
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)
        assert.equal(err.code, 'RANDOM')
      }
    })
  })

  describe('#writeState', () => {
    it('should return true when writing state file', async () => {
      const stateObj = { test: true }

      // Write out the test state object.
      const result = await uut.writeState(stateObj)

      assert.equal(result, true, 'Expect success returned')

      // Read the state object back in from the file.
      const writtenState = await uut.readState()
      // console.log('writtenState: ', writtenState)

      // Assert the values were written correctly to the file.
      assert.property(writtenState, 'test')
      assert.equal(writtenState.test, true)
    })

    it('should catch and throw random errors', async () => {
      try {
        // Force the fs library to throw an error.
        sandbox.stub(uut.fs, 'writeFile').throws({
          errno: -2,
          code: 'RANDOM',
          syscall: 'writeFile',
          path: 'state.json'
        })

        await uut.writeState({})
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.code, 'RANDOM')
      }
    })

    it('should catch and throw file system errors', async () => {
      try {
        sandbox.stub(uut.fs, 'writeFile').yields({
          errno: -2,
          code: 'RANDOM',
          syscall: 'writeFile',
          path: 'state.json'
        })

        await uut.writeState({})
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)
        assert.equal(err.code, 'RANDOM')
      }
    })
  })

  describe('#readState', () => {
    it('should create the state file if it does not exist', async () => {
      // Delete the state file if it exists.
      await uut.deleteState()

      // Ensure the readState() function creates a new file.
      const result = await uut.readState()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Test that the state object properties exist.
      assert.property(result, 'login')
      assert.property(result, 'password')
      assert.property(result, 'apiToken')

      // Test the default values are correct.
      assert.equal(result.login, 'demo@demo.com')
      assert.equal(result.password, 'demo')
    })

    it('should read existing state.json file', async () => {
      const testState = {
        test: true
      }

      // Write state to the json file.
      await uut.writeState(testState)

      // Read in the state file.
      const result = await uut.readState()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Test that the values were read in correctly from the state file.
      assert.property(result, 'test')
      assert.equal(result.test, true)
    })

    it('should catch and throw other errors', async () => {
      try {
        sandbox.stub(uut.fs, 'readFile').throws({
          errno: -2,
          code: 'RANDOM',
          syscall: 'readFile',
          path: 'state.json'
        })

        await uut.readState()
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.code, 'RANDOM')
      }
    })

    it('should catch and throw file system errors', async () => {
      try {
        sandbox.stub(uut.fs, 'readFile').yields({
          errno: -2,
          code: 'RANDOM',
          syscall: 'readFile',
          path: 'state.json'
        })

        await uut.readState()
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)
        assert.equal(err.code, 'RANDOM')
      }
    })
  })
})
