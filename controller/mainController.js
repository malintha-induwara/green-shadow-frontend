document.addEventListener("DOMContentLoaded", () => {
    
    const iframe = document.getElementById("contentFrame");
  
    
    const navLinks = document.querySelectorAll(".nav-link");
  
    
    navLinks.forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault(); 
  
    
        navLinks.forEach(nav => nav.classList.remove("bg-green-50"));
  
    
        link.classList.add("bg-green-50");
  
    
        const newSrc = link.getAttribute("data-src");
        iframe.setAttribute("src", newSrc);
      });
    });
  });
  