const lt = require('long-timeout')
const { run } = require('./src/core')
const check = require('./src/check')
const moment = require('moment')

function job() {
  const { signInTime } = run(check)
  lt.setTimeout(job, moment(signInTime).add(1, 'days') - moment())
}

job()
