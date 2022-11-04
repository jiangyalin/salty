// const url = 'https://test.shutuiche.com/token/getPayToken'
const url = '/token/getPayToken'
const _url = url.substring(url.lastIndexOf('.'))
const router = _url.substring(url.indexOf('/') - 2)

console.log('_url', router)
