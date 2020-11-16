const axios = require('axios')
const { handleInternalRequest, getOptions } = require('./helpers')

function sendEventNotification (event, type) {
  const path = `/api/notifications/${type}`
  const options = getOptions('post')
  options.body = { event }
  return handleInternalRequest(path, options)
}

async function getLocationDetails (locationID) {
  try {
    const options = getOptions()
    const url = `http://localhost:9000/api/locations/${locationID}`
    const location = await axios.get(url, options)
    return location.data
  } catch (e) {
    console.error(e)
    return {}
  }
}

module.exports = { getLocationDetails, sendEventNotification }
