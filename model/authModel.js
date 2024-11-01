const AUTH_ENDPOINTS = {
  SIGN_IN: "http://localhost:8080/api/v1/auth/signIn",
  REFRESH: "http://localhost:8080/api/v1/auth/refresh",
};

const TOKEN_KEY = "auth_token";

export async function signIn(email, password) {
  const response = await fetch(AUTH_ENDPOINTS.SIGN_IN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

export async function refreshToken() {
  const response = await fetch(
    `${AUTH_ENDPOINTS.REFRESH}?refreshToken=${getToken()}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
