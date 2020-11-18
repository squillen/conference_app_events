const axios = require('axios')
const CircuitBreaker = require('opossum')
const { handleInternalRequest, getOptions } = require('./helpers')

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 20, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000, // After 30 seconds, try again.
}

function sendEventNotification (event, type) {
  const path = `/api/notifications/${type}`
  const options = getOptions('post')
  options.body = { event }
  return handleInternalRequest(path, options)
}

async function requestLocationDetails (locationID) {
  try {
    const options = getOptions()
    const url = `http://localhost:9000/api/locations/${locationID}`
    const location = await axios.get(url, options)
    return location.data || location
  } catch (e) {
    console.error(e)
    return null
  }
}

async function getLocationDetails (locationID) {
  try {
    const breaker = new CircuitBreaker(requestLocationDetails, options)
    breaker.fallback((e) => console.log('Hitting fallback :::', e))
    const result = await breaker.fire(locationID)
    console.log('BREAKER RESULT :>> ', result)
    return result
  } catch (e) {
    console.error('BREAKER ERROR :::', e)
    return null
  }
}

module.exports = { getLocationDetails, sendEventNotification }
