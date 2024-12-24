const AUTH_ENDPOINTS = {
  SIGN_IN: "http://localhost:8080/api/v1/auth/signIn",
  REFRESH: "http://localhost:8080/api/v1/auth/refresh",
  SIGN_UP: "http://localhost:8080/api/v1/auth/signUp",
};

const TOKEN_KEY = "auth_token";
const TOKEN_ROLE = "auth_role";
const USER_EMAIL = "user_email";

function setCookie(name, value, expiryDays = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict; Secure`;
}

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return cookieValue ? cookieValue.split('=')[1] : null;
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
}

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
  const tokenData = extractJWTData(data.token);

  setCookie(TOKEN_KEY, data.token);
  localStorage.setItem(TOKEN_ROLE, tokenData.role);
  localStorage.setItem(USER_EMAIL, tokenData.email);
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
  const tokenData = extractJWTData(data.token);

  setCookie(TOKEN_KEY, data.token);
  localStorage.setItem(TOKEN_ROLE, tokenData.role);
  localStorage.setItem(USER_EMAIL, tokenData.email);
  return data.token;
}

function extractJWTData(token) {
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
    
    return {
      role: decodedPayload.role,
      email: decodedPayload.sub
    };
  } catch (error) {
    return { role: null, email: null };
  }
}

export function getEmail() {  
  return localStorage.getItem(USER_EMAIL);
}

export function clearEmail() {
  localStorage.removeItem(USER_EMAIL);
}


export function getRole() {
  return localStorage.getItem(TOKEN_ROLE);
}

export function clearRole() {
  localStorage.removeItem(TOKEN_ROLE);
}

export function getToken() {
  return getCookie(TOKEN_KEY);
}

export function clearToken() {
  removeCookie(TOKEN_KEY);
}

