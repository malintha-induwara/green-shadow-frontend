import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../model/userModel.js";

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

let currentSort = {
  field: "email",
  direction: "asc",
};
let users = [];

function openModal() {
  const modal = document.getElementById("userModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("userModal");
  modal.classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("userForm").reset();
  document.getElementById("userForm").removeAttribute("data-mode");
  document.getElementById("userForm").removeAttribute("data-edit-id");
  document.getElementById("saveUserBtn").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = "Add User";

  const formElements = document.getElementById("userForm").elements;
  for (let element of formElements) {
    element.disabled = false;
  }
}

function initializeUserSortHeaders() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    header.addEventListener("click", () => handleUserHeaderClick(header));
  });
}

function handleUserHeaderClick(header) {
  const field = header.getAttribute("data-field");

  if (field === currentSort.field) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.field = field;
    currentSort.direction = "asc";
  }

  updateUserSortIndicators();
  updateUsersTable();
}

function updateUserSortIndicators() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    const field = header.getAttribute("data-field");
    const existingIcon = header.querySelector(".sort-icon");

    if (existingIcon) existingIcon.remove();

    if (field === currentSort.field) {
      const icon = document.createElement("span");
      icon.className = "sort-icon ml-1 inline-block";

      icon.innerHTML =
        currentSort.direction === "asc"
          ? `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
           </svg>`
          : `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
           </svg>`;

      header.appendChild(icon);
    }
  });
}

function setupEmailValidation() {
  const emailInput = document.getElementById("email");
  emailInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid email address");
    }
  });
}

async function addUserToTable() {
  try {
    const userData = getUserData();
    let response = await addUser(userData);
    users.push(response);
    updateUsersTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "User added successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Add User",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

async function deleteUserFromTable(email) {
  try {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {

        deleteUser(email);
        users = users.filter((user) => user.email !== email);
        updateUsersTable();
        updateStats();

        Toast.fire({
          icon: "success",
          title: "User deleted successfully",
        });
      }
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete User",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

function editUser(email) {
  const user = users.find((user) => user.email === email);
  if (!user) return;

  document.getElementById("modalTitle").textContent = "Edit User";
  document.getElementById("email").disabled = true;
  document.getElementById("email").value = user.email;
  document.getElementById("password").value = user.password;
  document.getElementById("role").value = user.role;
  document.getElementById("userForm").setAttribute("data-mode", "edit");
  document.getElementById("userForm").setAttribute("data-edit-id", email);

  openModal();
}

function viewUser(email) {
  const user = users.find((user) => user.email === email);
  if (!user) return;

  document.getElementById("modalTitle").textContent = "View User";
  document.getElementById("email").value = user.email;
  document.getElementById("password").value = user.password;
  document.getElementById("role").value = user.role;
  document.getElementById("saveUserBtn").classList.add("hidden");

  const formElements = document.getElementById("userForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelUserBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

async function updateUserInTable(email) {
  const userData = getUserData();
  try {
    const updatedUser = await updateUser(email, userData);
    users = users.map((user) => (user.email === email ? updatedUser : user));
    updateUsersTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "User updated successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to update User",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

function getUserData() {
  const email = document.getElementById("email").value;
  const password =
    document.getElementById("password").value === ""
      ? "null"
      : document.getElementById("password").value;
  const role = document.getElementById("role").value;
  return { email: email, password: password, role: role };
}


function updateUsersTable() {
  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    const aVal =
      a[currentSort.field] === null ? "" : String(a[currentSort.field]);
    const bVal =
      b[currentSort.field] === null ? "" : String(b[currentSort.field]);

    comparison = aVal.localeCompare(bVal);

    return currentSort.direction === "asc" ? comparison : -comparison;
  });

  const tbody = document.getElementById("userTable");
  tbody.innerHTML = sortedUsers
    .map(
      (user) => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${
                      user.email
                    }</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "MANAGER"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "ADMINISTRATIVE"
                          ? "bg-green-100 text-green-800"
                          : user.role === "SCIENTIST"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }">
                      ${user.role}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                   <button data-email="${
                     user.email
                   }" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                   <button data-email="${
                     user.email
                   }" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                   <button data-email="${
                     user.email
                   }" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              `
    )
    .join("");

  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const cropCode = e.target.dataset.cropCode;
      viewUser(cropCode);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const email = e.target.dataset.email;
      editUser(email);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const email = e.target.dataset.email;
      deleteUserFromTable(email);
    });
  });
}

function updateStats() {
  const totalUsers = users.length;
  const scientistUsers = users.filter(
    (user) => user.role === "SCIENTIST"
  ).length;
  const adminUsers = users.filter(
    (user) => user.role === "ADMINISTRATIVE"
  ).length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("scientistUsers").textContent = scientistUsers;
  document.getElementById("adminUsers").textContent = adminUsers;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    users = await getAllUsers();
    updateUsersTable();
    updateStats();

    setupEmailValidation();
    initializeUserSortHeaders();

    document.getElementById("addUserBtn").addEventListener("click", openModal);
    document
      .getElementById("cancelUserBtn")
      .addEventListener("click", closeModal);

    // Close modal when clicking outside
    document.getElementById("userModal").addEventListener("click", (e) => {
      if (e.target.id === "userModal") {
        closeModal();
      }
    });

    document.getElementById("userForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = e.target.getAttribute("data-mode");

      if (mode === "edit") {
        const email = e.target.getAttribute("data-edit-id");
        updateUserInTable(email);
      } else {
        addUserToTable();
      }
      closeModal();
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Fetch user data",
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
});
