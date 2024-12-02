import {
  signIn,
  refreshToken,
  getToken,
  clearToken,
} from "../model/authModel.js";

//Toast Configs
const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  iconColor: "white",
  customClass: {
    popup: "colored-toast",
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});

const DASHBOARD_PATH = "pages/main.html";

document.addEventListener("DOMContentLoaded", async () => {
  const existingToken = getToken();
  if (existingToken) {
    try {
      await refreshToken();
      window.location.href = DASHBOARD_PATH;
    } catch (error) {
      clearToken();
    }
  }
  const loginForm = document.querySelector("form");
  loginForm.addEventListener("submit", handleLogin);
});

async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  try {
    await signIn(emailInput.value, passwordInput.value);
    window.location.href = DASHBOARD_PATH;
  } catch (error) {
    Toast.fire({
      icon: "error",
      title: "Credentials are incorrect",
    });
  }
}
