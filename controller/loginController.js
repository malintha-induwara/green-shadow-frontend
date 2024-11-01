import { signIn, refreshToken, getToken, clearToken } from '../model/authModel.js';

const DASHBOARD_PATH = 'pages/main.html';


document.addEventListener('DOMContentLoaded', async () => {
  const existingToken = getToken();
  if (existingToken) {
    try {
      await refreshToken();
      window.location.href = DASHBOARD_PATH;
    } catch (error) {
      clearToken();
    }
  }

  const errorAlert = document.getElementById('errorAlert');
  errorAlert.style.display = 'none';

  const loginForm = document.querySelector('form');
  loginForm.addEventListener('submit', handleLogin);
});


async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  try {
    await signIn(emailInput.value, passwordInput.value);
    window.location.href = DASHBOARD_PATH;
  } catch (error) {
    showError('Credentials Are Wrong');
  }
}

function showError(message) {
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = errorAlert.querySelector('span');
  
  errorMessage.textContent = message;
  errorAlert.style.display = 'flex';

  setTimeout(() => {
    errorAlert.style.display = 'none';
  }, 5000);
}
