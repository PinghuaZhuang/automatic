const fs = require('fs')
const path = require('path')
const Editor = require('./Editor')

async function job() {
  const filePath = path.resolve(__dirname, '../../README.md')
  const options = {
    encoding: 'utf8',
  }
  const content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  if (jsqpro) {
    const jsqproContent = jsqpro.content
    jsqpro.content = jsqproContent.replace(/\{11\}/g, '心情好')
    await fs.writeFileSync(filePath, Editor.replaceSection(content, jsqpro), options)
  }
}

job()
