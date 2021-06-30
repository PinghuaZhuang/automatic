const path = require('path')
const fetch = require('node-fetch')

function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay * 1000))
}

function resolve(url) {
  return path.resolve(__dirname, url)
}

async function sendDD(token, content, times = { groups: { times: '' } }) {
  console.log('>>> 发送钉钉消息.')
  const raw = JSON.stringify({
    'msgtype': 'markdown',
    'markdown': {
      'title': 'jsqpro 自动签到结果',
      'text': `${times.groups.times}\n\n${content}`,
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
  await fetch(`https://oapi.dingtalk.com/robot/send?access_token=${token}`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(`>>> 发送消息成功.`, result))
    .catch(error => console.log('<<< 发送消息失败.', error))
}

function killByPid(pid){
  if (/^win/.test(process.platform)) {
      child_process.spawn("taskkill", ["/PID", pid, "/T", "/F"])
  } else {
      process.kill(-pid, 'SIGTERM')
  }
}

module.exports = {
  sleep,
  resolve,
  sendDD,
  killByPid,
}
