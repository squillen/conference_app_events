const axios = require('axios')

function getOptions (method = 'get') {
  return {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    method,
  }
}

async function callAPI (path, options) {
  // TODO change this! To what?
  const host = 'http://localhost:3000'
  const url = host + path
  const method = options.method.toLowerCase() || 'get'
  try {
    const result = await axios[method](url, options.body || {})
    if (result.data) return result.data
    const error = `Unable to make request to ::: ${path} ::: \n`
    console.error(error + result)
    throw new Error(error)
  } catch (err) {
    const errMsg = err.message || err
    console.error(`callAPI() error to ${url} ::: ${errMsg}`)
    throw errMsg
  }
}

function handleInternalRequest (path, options) {
  return callAPI(path, options)
    .then(response => response.success || response.error || response)
    .catch(err => new Error(err))
}

module.exports = { getOptions, handleInternalRequest }
