const BASE_URL  = "https://fil-x-connect-final-backend.onrender.com/api"; // Replace with your backend's public IP
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
