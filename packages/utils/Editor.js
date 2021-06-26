const moment = require('moment')

const Editor = {
  regs: {
    // /\<\!--\s*@protocol:(?<section>.*):start\s*--\>(?<content>[\s\S]*?)\<\!--\s*@protocol:\k<section>:end\s*--\>/g
    tree: new RegExp('\\<\\!--\\s*@protocol:(?<section>.*):start\\s*--\\>(?<content>[\\s\\S]*?)\\<\\!--\\s*@protocol:\\k<section>:end\\s*--\\>', 'g'),
  },
  cloneRegExp(regExp) {
    return new RegExp(regExp.source, regExp.flags)
  },
  createRegExpWithSection(section) {
    return new RegExp(`(\\<\\!--\\s*@protocol:${section}:start\\s*--\\>)[\\s\\S]*?(\\<\\!--\\s*@protocol:${section}:end\\s*--\\>)`)
  },
  replaceSection(source, target) {
    const content = target.content
    return source.replace(
      this.createRegExpWithSection(target.section),
      `$1${content}$2`
    )
  },
  structureObj(content, regExp) {
    const target = {}
    const r = this.cloneRegExp(regExp || this.regs.tree)
    let t
    while ((t = r.exec(content))) {
      const _t = {
        source: t.groups.content,
        content: t.groups.content,
        section: t.groups.section,
        children: this.structureObj(t.groups.content),
        lastIndex: r.lastIndex,
      }
      t.groups && (target[_t.section] = _t)
    }
    return target
  },
  signInTxt() {
    return `\n<!-- checked: -->\n\n| {11}(日) | {12}(一) | {13}(二) | {14}(三) | {15}(四) | {16}(五) | {17}(六) |
| -------------- | -------------- | -------------- | -------------- | -------------- | -------------- | -------------- |
|                |                |                |                |                |                |                |\n\n`
  },
  replaceWeek(content, count = 1) {
    if (count > 7) return content
    return this.replaceWeek(
      content.replace(`{1${count}}`, moment().weekday(count - 1).format(moment.HTML5_FMT.DATE)),
      count + 1
    )
  },
  replaceCheck(content, val) {
    const no = this.subDays(moment(val), moment().weekday(0)) + 1
    const reg = new RegExp(`--------\\s\\|\\n((\\|[^\\|]*){${no}})(\\|[^\\|]*)`)
    return content
      .replace(reg, `-------- \|\n$1|       🟢       `)
  },
  subDays(a, b) {
    return Math.floor((a - b) / (1000 * 60 * 60 * 24))
  },
}

module.exports = Editor