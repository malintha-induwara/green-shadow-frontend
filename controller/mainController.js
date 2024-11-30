import { getRole,getToken } from '../model/authModel.js';


const rolePermissions = {
  MANAGER: ['dashboard', 'crop', 'cropDetail', 'equipment', 'field', 'staff', 'user', 'vehicle'],
  SCIENTIST: ['dashboard', 'crop', 'cropDetail'],
  ADMINISTRATOR: ['dashboard', 'equipment', 'staff', 'user', 'vehicle']
};


function hasPermission(navItem) {
  const userRole = getRole();
  if (!userRole) return false;
  
  const pageName = navItem.getAttribute('data-src')
    .split('/')
    .pop()
    .replace('Management.html', '')
    .replace('.html', '');
    
  return rolePermissions[userRole]?.includes(pageName);
}

document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("contentFrame");
  const navLinks = document.querySelectorAll(".nav-link");
  const userRole = getRole();
  const token = getToken();

  if (!userRole || !token) {
    window.location.href = '/index.html';
    return;
  }
 
  navLinks.forEach(link => {
    if (!hasPermission(link)) {
      link.parentElement.style.display = 'none'; 
    }

    link.addEventListener("click", event => {
      event.preventDefault();

      if (!hasPermission(link)) {
        alert('You do not have permission to access this page');
        return;
      }

      navLinks.forEach(nav => nav.classList.remove("bg-green-50"));
      link.classList.add("bg-green-50");
      
      const newSrc = link.getAttribute("data-src");
      iframe.setAttribute("src", newSrc);
    });
  });
});