const { handleInternalRequest, getOptions } = require('./helpers')

function sendEventNotification (event, type) {
  const path = `/api/notifications/${type}`
  const options = getOptions('post')
  options.body = { event }
  return handleInternalRequest(path, options)
}

module.exports = { sendEventNotification }
