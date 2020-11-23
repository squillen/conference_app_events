const axios = require('axios')
const { handleInternalRequest, getOptions } = require('./helpers')

function sendEventNotification (event, type) {
  const path = `/api/notifications/${type}`
  const options = getOptions('post')
  options.body = { event }
  return handleInternalRequest(path, options)
}

async function requestLocationDetails (locationID) {
  try {
    const options = getOptions()
    const url = `${process.env.LOCATIONS_URI}/api/locations/${locationID}`
    const location = await axios.get(url, options)
    return location.data || location
  } catch (e) {
    console.error(e)
    return null
  }
}

async function getLocationDetails (locationID) {
  try {
    return await requestLocationDetails(locationID)
  } catch (e) {
    console.error('ERROR WITH LOCATIONS MICROSERVICE:::', e)
    return null
  }
}

module.exports = { getLocationDetails, sendEventNotification }
