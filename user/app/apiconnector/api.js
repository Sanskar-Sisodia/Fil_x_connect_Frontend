const BASE_URL = 'http://43.205.229.123:8080'; // Replace with your backend's public IP
export async function apiRequest(endPoint, method, body) {
  const url = `${BASE_URL}/${endPoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
