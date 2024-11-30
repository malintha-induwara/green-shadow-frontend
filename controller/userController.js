import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../model/userModel.js";

let users = [];

// Modal Control
function openModal() {
  const modal = document.getElementById("userModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("userModal");
  modal.classList.add("hidden");
  resetForm();
}

// Form Control
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
  } catch (error) {
    console.error(error);
    alert("Failed to add user");
  }
}

async function deleteUserFromTable(email) {
  try {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(email);
      users = users.filter((user) => user.email !== email);
      updateUsersTable();
      updateStats();
    }
  } catch (error) {
    console.error(error);
    alert("Failed to delete user");
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
  } catch (error) {
    console.error(error);
    alert("Failed to update user");
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

// UI Updates

function updateUsersTable() {
  const tbody = document.getElementById("userTable");
  tbody.innerHTML = users
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
                   <button data-crop-code="${
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

  // Add event listeners for edit buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const email = e.target.dataset.email;
      editUser(email);
    });
  });

  // Add event listeners for delete buttons
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

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch users from API
    users = await getAllUsers();
    updateUsersTable();
    updateStats();

    setupEmailValidation();

    // Set Event Listenres for open and close modal
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

    // Form submission handling
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
    console.error(error);
    alert("Failed to fetch users");
  }
});
