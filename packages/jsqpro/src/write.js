const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')
const { exec } = require('child_process')

/* module.exports =  */async function job(signInTime = '2021-06-26') {
  console.log(`>>> 更新 README.md.`)
  const filePath = path.resolve(__dirname, '../../../README.md')
  const options = {
    encoding: 'utf8',
  }
  const content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  if (jsqpro) {
    let times = /\<\!-- checked:(?<times>[^\s]*) --\>/.exec(content)
    jsqpro.content = Editor.replaceWeek(Editor.signInTxt())
    if (times) {
      times = times.groups.times.replace(/;$/, '')
      times = [...new Set([...times.split(';'), signInTime])]
      console.log(`>>> times:`, times)
      jsqpro.content = jsqpro.content.replace(/\<\!-- checked:([^\s]*) --\>/, `<!-- checked:${times.join(';')} -->`)
      times.forEach(time => {
        jsqpro.content = Editor.replaceCheck(jsqpro.content, time)
      })
    }
    console.log(`>>> check table:`, jsqpro.content)
    await fs.writeFileSync(filePath, Editor.replaceSection(content, jsqpro), options)

    // exec(`git --version`, function (e, b) {
    //   console.log('2222', e, b)
    // })
    // exec(`git --version`)
    // exec(`git add .`)
    // exec(`git commit -m 'Check: README.md'`)
    // exec(`git push`)
  }
}
job()
