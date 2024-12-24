import {
  getRole,
  getToken,
  clearRole,
  clearEmail,
  clearToken,
  refreshToken,
} from "../model/authModel.js";

const rolePermissions = {
  MANAGER: [
    "dashboard",
    "crop",
    "cropDetail",
    "equipment",
    "field",
    "staff",
    "user",
    "vehicle",
    "settings"
  ],
  SCIENTIST: ["dashboard", "crop", "cropDetail"],
  ADMINISTRATIVE: ["dashboard", "equipment", "staff", "user", "vehicle","settings"],
  OTHER: ["dashboard"],
};

function hasPermission(navItem) {
  const userRole = getRole();
  if (!userRole) return false;

  const pageName = navItem
    .getAttribute("data-src")
    .split("/")
    .pop()
    .replace("Management.html", "")
    .replace(".html", "");

  return rolePermissions[userRole]?.includes(pageName);
}

document.addEventListener("DOMContentLoaded", async () => {
  const iframe = document.getElementById("contentFrame");
  const navLinks = document.querySelectorAll(".nav-link");
  const userRole = getRole();
  const token = getToken();

  if (!userRole || !token) {
    window.location.href = "/index.html";
    return;
  }

  if (token) {
    try {
      await refreshToken();
    } catch (error) {
      clearToken(); 
      clearRole();
      window.location.href = "/index.html";
    }
  }

  navLinks.forEach((link) => {
    if (!hasPermission(link)) {
      link.parentElement.style.display = "none";
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();

      navLinks.forEach((nav) => nav.classList.remove("bg-green-50"));
      link.classList.add("bg-green-50");

      const newSrc = link.getAttribute("data-src");
      iframe.setAttribute("src", newSrc);
    });
  });

  const logoutButton = document.getElementById("logOutButton");
  logoutButton.addEventListener("click", () => {
    clearToken();
    clearRole();
    clearEmail();
    window.location.href = "/index.html";
  });
});
