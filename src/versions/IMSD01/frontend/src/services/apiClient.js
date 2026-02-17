const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const error = new Error('Unexpected response from API.');
    error.payload = text;
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || 'Request failed');
    error.payload = payload;
    throw error;
  }
  return payload.data;
};

const get = (path) => request(path, { method: 'GET' });
const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

export { get, post };
