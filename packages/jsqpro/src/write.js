const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')
const { sleep } = require('utils')

module.exports = async function job(signInTime = '') {
  console.log(`>>> 更新 README.md.`)
  const errorCallback = function (error) {
    if (error) {
      throw error
    }
  }
  const filePath = path.resolve(__dirname, '../../../README.md')
  const content = await fs.readFile(filePath, 'utf8', errorCallback)
  const { jsqpro } = Editor.structureObj(content)

  if (jsqpro) {
    let times = /\<\!-- checked:(?<times>[^\s]*) --\>/.exec(content)
    jsqpro.content = Editor.replaceWeek(Editor.signInTxt())
    if (times) {
      times = times.groups.times.replace(/;$/, '')
      times = [...new Set([...times.split(';'), moment(signInTime).format(moment.HTML5_FMT.DATE)])]
      console.log(`>>> times:`, times)
      jsqpro.content = jsqpro.content.replace(/\<\!-- checked:([^\s]*) --\>/, `<!-- checked:${times.join(';')} -->`)
      times.forEach(time => {
        jsqpro.content = Editor.replaceCheck(jsqpro.content, time)
      })
    }
    console.log(`>>> check table:`, jsqpro.content)
    await fs.writeFile(filePath, Editor.replaceSection(content, jsqpro), 'utf8', errorCallback)
    sleep(3)
  }
}
// job()
