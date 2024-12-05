import {
  signUp,
  getToken,
  getRole,refreshToken,clearToken,
  clearRole
} from "../model/authModel.js";

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

const DASHBOARD_PATH = "/pages/main.html";
const LOGIN_PATH = "../index.html";

document.addEventListener("DOMContentLoaded", async () => {
  const existingToken = getToken();
  if (existingToken) {
    try {
      await refreshToken();
      const userRole =  getRole();
      if (userRole !== 'OTHER') {
        window.location.href = DASHBOARD_PATH;
        return;
      }
    } catch (error) {
      clearToken();
      clearRole();
    }
  }
  
  const signupForm = document.querySelector("form");
  signupForm.addEventListener("submit", handleSignup);
});

async function handleSignup(event) {
  event.preventDefault();

  const emailInput = document.querySelector('input[type="email"]');
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  const password = passwordInputs[0].value;
  const confirmPassword = passwordInputs[1].value;

  if (password !== confirmPassword) {
    Toast.fire({
      icon: "error",
      title: "Passwords do not match",
    });
    return;
  }

  try {
    await signUp(emailInput.value, password);
    await Toast.fire({
      icon: "success",
      title: "Registration successful! Please log in.",
    });
    window.location.href = LOGIN_PATH;
  } catch (error) {
    Toast.fire({
      icon: "error",
      title: error.message === "User already exists" ? "Email already registered" : "Registration failed",
    });
  }
}