const lt = require('long-timeout')
const { run } = require('./src/core')
const check = require('./src/check')

(function job() {
  const { inviteAddress } = run(check)
  lt.setTimeout(job, 1000 * 60 * 60 * 23.8)
})()
