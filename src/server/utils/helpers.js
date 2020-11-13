const axios = require('axios');

export function getOptions(method = 'get') {
  return {
    headers: {
      'Content-Type': 'application/json',
      issuer: 'guest',
      accept: 'application/json',
    },
    method,
  };
}

export async function callAPI(path, options) {
  const host = window.location.origin
  const url = host + path;
  const method = options.method.toLowerCase() || 'get';
  try {
    const result = await axios[method](url, options.body || {});
    if (result.data) return result.data;
    const error = `Unable to make request to ::: ${path} ::: \n`;
    console.error(error + result);
    throw new Error(error);
  } catch (err) {
    const errMsg = err.message || err;
    console.error(`callAPI() error to ${url} ::: ${errMsg}`);
    throw errMsg;
  }
}

export function handleInternalRequest(path, options) {
  return callAPI(path, options)
    .then(response => response.success || response.error || response)
    .catch(err => new Error(err));
}