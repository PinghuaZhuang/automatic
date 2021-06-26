const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')
const moment = require('moment')

module.exports = async function job(signInTime = '2021-06-26', inviteAddress = 'https://registered.jsqpro.store/auth/register') {
  console.log(`>>> 更新 README.md.`)
  const filePath = path.resolve(__dirname, '../../../README.md')
  const options = {
    encoding: 'utf8',
  }
  let content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  if (jsqpro) {
    let times = /\<\!-- checked:(?<times>[^\s]*) --\>/.exec(content)
    jsqpro.content = Editor.replaceWeek(Editor.signInTxt())
    if (times) {
      times = times.groups.times.replace(/;$/, '')
      times = [...new Set([...times.split(';'), moment(signInTime).format(moment.HTML5_FMT.DATE)])].filter(o => moment(o).format() !== 'Invalid date')

      console.log(`>>> times:`, times)
      jsqpro.content = jsqpro.content.replace(/\<\!-- checked:([^\s]*) --\>/, `<!-- checked:${times.join(';')} -->`)
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
