const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')

module.exports = async function job(signInTime = '2021-06-26') {
  console.log(`>>> 更新 README.md.`)
  const filePath = path.resolve(__dirname, '../../../README.md')
  const options = {
    encoding: 'utf8',
  }
  const content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  if (jsqpro) {
    const times = /\<\!-- checked:(?<times>[^\s]*) --\>/.exec(content)
    jsqpro.content = Editor.replaceWeek(Editor.signInTxt())
    if (times) {
      console.log(`>>> times:`, times.groups.times)
      times.groups.times
        .replace(/;$/, '')
        .split(';')
        .forEach(time => {
          jsqpro.content = Editor.replaceCheck(jsqpro.content, time)
        })
    }
    jsqpro.content = Editor.replaceCheck(jsqpro.content , signInTime)
    console.log(`>>> check table:`, jsqpro.content)
    await fs.writeFileSync(filePath, Editor.replaceSection(content, jsqpro), options)
  }
}
