const copy = (text = '') => {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.style.position = 'absolute'
  textarea.style.clip = 'rect(0 0 0 0)'
  textarea.value = text
  textarea.select()
  document.execCommand('copy', true)
}

const toHump = (name = '') => name.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase())

class VDom {
  constructor (tag, data, value, type) {
    this.tag = tag && tag.toLowerCase() // 节点名
    this.data = data // 属性
    this.value = value // 文本数据
    this.type = type // 节点类型
    this.children = []
  }

  appendChild (vnode) {
    this.children.push(vnode)
  }
}

function getVNode (node) {
  let nodeType = node.nodeType
  let _vnode = null
  if (nodeType === 1) {
    // 元素
    let tag = node.nodeName
    let attrs = node.attributes
    let _attrObj = {}
    for (let i = 0; i < attrs.length; i++) {
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue
    }
    _vnode = new VDom(tag, _attrObj, undefined, nodeType)

    let children = node.childNodes
    for (let i = 0; i < children.length; i++) {
      _vnode.appendChild(getVNode(children[i]))
    }
  } else if (nodeType === 3) {
    // 文本
    _vnode = new VDom(node.nodeName, undefined, node.nodeValue, nodeType)
  }
  return _vnode
}

function parseVNode (vnode) {
  let type = vnode.type
  let rdom = null
  if (type === 1) {
    rdom = document.createElement(vnode.tag)
    // 元素
    let attrs = vnode.data
    for (let key in attrs) {
      rdom.setAttribute(key, attrs[key])
    }
    let children = vnode.children
    for (let i = 0; i < children.length; i++) {
      rdom.appendChild(parseVNode(children[i]))
    }
  } else if (type === 3) {
    // 文本
    rdom = document.createTextNode(vnode.value)
  }
  return rdom
}

class Api {
  type = ''
  url = ''
  query = {}
  body = {}
  path = {}
  header = {}

  constructor ({ type, url, query, body, path, header }) {
    this.type = type
    this.url = url
    this.query = query
    this.body = body
    this.path = path
    this.header = header
  }
}

const getData = (vNode) => {
  const item = vNode
  console.log('item', item)
  const parameter = []

  if (item.tag === 'table') {
    for (let j = 0; j < (item.children[3].children.length - 1) / 2; j++) {
      const key = item.children[3].children[j * 2 + 1].children[1].children[0].children[0].value
      const value = item.children[3].children[j * 2 + 1].children[3].children[1]?.children[0]?.value || ''
      const isRequired = item.children[3].children[j * 2 + 1].children[5].children[0].value === '是'
      const type = item.children[3].children[j * 2 + 1].children[7].children[0].value
      const describe = item.children[3].children[j * 2 + 1].children[9].children[1]?.children[0]?.value || ''
      parameter.push({
        key,
        value,
        isRequired,
        type,
        describe
      })
    }
  } else if (item.tag === 'div') {
    const data = JSON.parse(item.children[3].data.value)
    for (const key in data) {
      parameter.push({
        key,
        value: data[key]
      })
    }
  }

  return parameter
}

window.onload = function () {
  $('#基本信息').append('<button type="button" class="u-btn j-copy">生成api函数</button>')

  $('body').on('click', '.j-copy', () => {

    const api = new Api({ type: 'aa' })

    // console.log('api', api)
    const type = $('.apipost-doc-wrap-base-para .method').text().toLowerCase()
    const url = $('.apipost-doc-wrap-base-para li:nth-child(2) .copy-clipboard').text()
    let header = []
    let query = []
    let body = []
    const res = getData(getVNode(document.querySelector('.apipost-doc-paras[for-id="响应示例"]')).children[3])

    const dataVNode = getVNode(document.querySelector('.apipost-doc-paras[for-id="请求参数"]'))

    // console.log('getVNode', dataVNode)

    for (let i = 0; i < Math.floor((dataVNode.children.length - 1) / 4); i++) {
      const dataTypeMap = {
        'Header 请求参数': 'header',
        'Query 请求参数': 'query',
        'Body 请求参数': 'body'
      }
      const dataType = dataTypeMap[dataVNode.children[i * 4 + 1].data.id]

      switch (dataType) {
        case 'header': {
          const item = dataVNode.children[i * 4 + 3]

          header = getData(item)

          break
        }
        case 'query': {
          const item = dataVNode.children[i * 4 + 3]

          query = getData(item)

          break
        }
        case 'body': {
          const item = dataVNode.children[i * 4 + 3]

          body = getData(item)

          break
        }
      }
    }

    // console.log('header', header)
    // console.log('query', query)
    // console.log('body', body)
    // console.log('res', res)
    //
    // console.log('type', type)
    // console.log('url', url)

    const _url = url.substring(url.lastIndexOf('.'))
    const router = _url.substring(url.indexOf('/') - 2)

    const _router = router.substring(router.lastIndexOf('/') + 1)
    const funName = toHump('_' + _router)

    const copyData =
      `const ${type}${funName} = query => {
        return ajax({
          url: '${router}',
          method: '${type}'
        }, query)
      }`

    // console.log('copyData', copyData)

    copy(copyData)
  })
}
