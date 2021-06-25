const lt = require('long-timeout')
const { run } = require('./src/core')
const check = require('./src/check')

(function job() {
  const { preTime, inviteAddress } = run(check)
  // TODO: 更新这些信息到 README.md
  lt.setTimeout(job, 1000 * 60 * 60 * 23.8)
})()
