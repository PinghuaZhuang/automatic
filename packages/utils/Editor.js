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
  txt() {
    return `| {11} | {12} | {13} | {14} | {15} | {16} | {17} |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| {21} | {22} | {23} | {24} | {25} | {26} | {27} |`
  },
}

module.exports = Editor
