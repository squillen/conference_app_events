const { handleInternalRequest, getOptions } = require('./helpers')

async function sendEventNotification(event, type) {
  try {
    const path = `/api/notifications/${type}`;
    const options = getOptions('post');
    options.body = { event }
    console.log('path :>> ', path);
    const result = await handleInternalRequest(path, options);
    console.log('result :>> ', result);
  } catch (e) {
    console.error(e)
  }
}

module.exports = { sendEventNotification }