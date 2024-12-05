import {
  signIn,
  refreshToken,
  getToken,
  clearToken,
  clearRole,
  getRole,
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
const LOGIN_PATH = "login.html";

document.addEventListener("DOMContentLoaded", async () => {
  const existingToken = getToken();
  if (existingToken) {
    try {
      await refreshToken();
      const userRole =  getRole();
      
      if (userRole === 'OTHER') {
        await Toast.fire({
          icon: "error",
          title: "Access denied. Insufficient permissions.",
        });
        clearToken();
        clearRole();
        return;
      }
      
      window.location.href = DASHBOARD_PATH;
    } catch (error) {
      clearToken();
      clearRole();
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
    
    // Check role after successful login
    const userRole = await getRole();
    if (userRole === 'OTHER') {
      await Toast.fire({
        icon: "error",
        title: "Access denied. Insufficient permissions.",
      });
      clearToken();
      return;
    }
    
    window.location.href = DASHBOARD_PATH;
  } catch (error) {
    Toast.fire({
      icon: "error",
      title: "Credentials are incorrect",
    });
  }
}