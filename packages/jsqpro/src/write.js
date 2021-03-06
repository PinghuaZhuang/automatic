const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')
const moment = require('moment')
const { timesReg } = require('utils')
// const DATE = moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
const DATE = 'YYYY-MM-DD HH:mm:ss'

moment.locale('zh-cn')

module.exports = async function job(signInTime = '2021-01-01', inviteAddress = 'https://registered.jsqpro.store/auth/register') {
  console.log(`>>> 更新 README.md.`, signInTime)
  const filePath = path.resolve(__dirname, '../../../README.md')
  const options = {
    encoding: 'utf8',
  }
  let content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)
  const today = moment().format(DATE)

  if (jsqpro) {
    let times = timesReg.exec(content)
    jsqpro.content = Editor.replaceWeek(Editor.signInTxt())
    if (times) {
      // 每月1日重置
      if (moment().date(1).format(DATE) === moment().format(DATE)) {
        await fs.writeFileSync(path.resolve(__dirname, `../log/${moment().month()}.txt`), times.join(';\n'), options)
        times = []
      } else {
        times = times.groups && times.groups.times.replace(/;$/, '').split(';') || []
      }
      if (signInTime !== '-1') {
        times.push(moment(signInTime).format(DATE))
      }
      // 去重
      times = [...new Set([...times])]
      times = times.filter(o => moment(o).format() !== 'Invalid date')
      console.log(`>>> times:`, times, signInTime)
      if (signInTime === '-1' && !times.includes(today)) {
        console.log(`<<<<<< 签到失败!`)
        times.forEach(time => {
          jsqpro.content = Editor.replaceCheck(jsqpro.content, time)
        })
        jsqpro.content = Editor.replaceCheck(jsqpro.content, today, true)
        console.log(`>>> check table:`, jsqpro.content)
        return
      }
      jsqpro.content = jsqpro.content.replace(timesReg, `<!-- checked:${times.join(';')} -->`)
      times.forEach(time => {
        jsqpro.content = Editor.replaceCheck(jsqpro.content, time)
      })
    }

    // 邀请链接
    content = content.replace(
      /\[https:\/\/registered\.jsqpro\.store\/auth\/register\]\([^\s]*?\)/,
      `[https://registered.jsqpro.store/auth/register](${inviteAddress})`
    )

    console.log(`>>> check table:`, jsqpro.content)
    await fs.writeFileSync(filePath, Editor.replaceSection(content, jsqpro), options)
  }
}
// job()
