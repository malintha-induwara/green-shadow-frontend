const AUTH_ENDPOINTS = {
  SIGN_IN: "http://localhost:8080/api/v1/auth/signIn",
  REFRESH: "http://localhost:8080/api/v1/auth/refresh",
  SIGN_UP: "http://localhost:8080/api/v1/auth/signUp",
};

const TOKEN_KEY = "auth_token";
const TOKEN_ROLE = "auth_role";

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
  const role = extractJWTRole(data.token);

  localStorage.setItem(TOKEN_ROLE, role);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

export async function signUp(email, password) {
  const response = await fetch(AUTH_ENDPOINTS.SIGN_UP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 409) {
    throw new Error("User already exists");
  }

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  const data = await response.json();
  return data;
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
  const role = extractJWTRole(data.token);

  localStorage.setItem(TOKEN_ROLE, role);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

function extractJWTRole(token) {
  try {
    const payload = token.split('.')[1];
    
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    
    return decodedPayload.role;
  } catch (error) {
    return null;
  }
}

export function getRole() {
  return localStorage.getItem(TOKEN_ROLE);
}

export function clearRole() {
  localStorage.removeItem(TOKEN_ROLE);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
