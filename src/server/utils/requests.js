import { handleInternalRequest, getOptions } from './helpers'

export function sendEventNotification(event, type) {
  const path = `/api/notifications/${type}`;
  const options = getOptions('post');
  options.body = { event }
  return handleInternalRequest(path, options);
}