const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true, // use SSL
  auth: {
    name: 'Pinghua Zhuang',
    user: 'zphua2016',
    // 这里密码不是qq密码，是你设置的smtp授权码
    pass: process.env.JSQPRO_EMAIL_PASS,
  },
  proxy: 'http://localhost:7890',
})

module.exports = async function () {
  const filePath = path.resolve(__dirname, '../../README.md')
  const options = {
    encoding: 'utf8',
  }
  let content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  const mailOptions = {
    from: 'zphua2016@gmail.com', // 接收邮箱
    to: '995382997@qq.com', // 发送邮箱必须与上面开通ssl的邮箱一致
    subject: 'jsqpro 自动签到结果', // 标题
    //text: 'Hello world?', // text html二者选一
    html: jsqpro.content,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('发送失败！邮箱是否正确');
    } else {
      console.log(info);
    }
  })
}
