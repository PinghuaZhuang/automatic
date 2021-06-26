const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const Editor = require('utils/Editor')
const marked = require('marked')
const fetch = require('node-fetch')

const args = {}
process.argv.slice(2).forEach(k => {
  const t = k.split('=')
  args[t[0].replace(/-/g, '')] = t[1]
})

const transporter = nodemailer.createTransport({
  service: 'qq', // 使用内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  port: 465, // SMTP 端口
  secureConnection: true, // 使用 SSL
  auth: {
    user: '995382997@qq.com',
    // 这里密码不是qq密码，是你设置的smtp授权码
    pass: args.pass,
  },
})

async function sendDD(content) {
  const raw = JSON.stringify({
    'msgtyp': 'markdown',
    'markdown': {
      'titit': 'jsqpro 自动签到结果',
      'text': content,
      'at': [
        '13602629903'
      ]
    }
  })
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  }
  await fetch('https://oapi.dingtalk.com/robot/send?access_token=de8411b704f9af18d09b2fda554a2ae370d5d816d596a9339dc925247bd69f48', requestOptions)
    .then(response => response.text())
    .then(result => console.log(`>>> 发送钉钉机器人成功.`, result))
    .catch(error => console.log('<<< 发送钉钉机器人失败.', error))
}

async function sendEmail() {
  const filePath = path.resolve(__dirname, '../../README.md')
  const options = {
    encoding: 'utf8',
  }
  let content = await fs.readFileSync(filePath, options)
  const { jsqpro } = Editor.structureObj(content)

  const mailOptions = {
    from: '995382997@qq.com', // 发送邮箱必须与上面开通ssl的邮箱一致
    to: 'zphua2016@gmail.com', // 接收邮箱
    subject: 'jsqpro 自动签到结果', // 标题
    //text: 'Hello world?', // text html二者选一
    html: marked(jsqpro.content),
  }

  sendDD(jsqpro.content)

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('<<< 发送失败！邮箱是否正确', error);
    } else {
      console.log('>>> 发送邮件成功. ');
    }
  })
}

sendEmail()
