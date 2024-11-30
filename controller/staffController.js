import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../model/staffModel.js";

let staffs = [];

// Modal Control
function openModal() {
  const modal = document.getElementById("staffModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("staffModal");
  modal.classList.add("hidden");
  resetForm();
}

// Form Control
function resetForm() {
  document.getElementById("staffForm").reset();
  document.getElementById("staffForm").removeAttribute("data-mode");
  document.getElementById("staffForm").removeAttribute("data-edit-id");
  document.getElementById("staffIdContainer").classList.add("hidden");
  document.getElementById("saveStaffBtn").classList.remove("hidden");

  const formElements = document.getElementById("staffForm").elements;
  for (let element of formElements) {
    if (element.closest("#staffIdContainer")) continue;
    element.disabled = false;
  }
}


function setupFieldValidation() {

  const firstNameInput = document.getElementById("firstName");
  firstNameInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!nameRegex.test(this.value)) {
      this.setCustomValidity("First name can only contain letters and single spaces between words");
    }
  });


  const lastNameInput = document.getElementById("lastName");
  lastNameInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!nameRegex.test(this.value)) {
      this.setCustomValidity("Last name can only contain letters and single spaces between words");
    }
  });


  const designationInput = document.getElementById("designation");
  designationInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const designationRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!designationRegex.test(this.value)) {
      this.setCustomValidity("Designation can only contain letters and single spaces between words");
    }
  });


  const contactNoInput = document.getElementById("contactNo");
  contactNoInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const contactRegex = /^(\+)?[\d\s-]+$/;
    if (!contactRegex.test(this.value)) {
      this.setCustomValidity("Contact number can only contain digits, spaces, hyphens, and an optional + at the start");
    }
  });


  const addressInputs = [
    "addressLine01", "addressLine02", "addressLine03", 
    "addressLine04", "addressLine05"
  ];

  addressInputs.forEach(inputId => {
    const addressInput = document.getElementById(inputId);
    addressInput.addEventListener("input", function () {
      this.setCustomValidity("");
      const addressRegex = /^[A-Za-z0-9\s,.-]+$/;
      if (this.value && !addressRegex.test(this.value)) {
        this.setCustomValidity("Address can only contain letters, numbers, spaces, and basic punctuation");
      }
    });
  });


  const emailInput = document.getElementById("email");
  emailInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid email address");
    }
  });
}


async function addStaffToTheTable() {
  try {
    const staffData = getStaffData();
    let response = await addStaff(staffData);
    staffs.push(response);
    updateStaffTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to add staff");
  }
}

async function deleteStaffFromTable(id) {
  try {
    if (confirm("Are you sure you want to delete this staff?")) {
      await deleteStaff(id);
      staffs = staffs.filter((staff) => staff.staffId !== id);
      updateStaffTable();
      updateStats();
    }
  } catch (error) {
    // console.error(error);
    alert(error.message);
  }
}

function editStaff(staffId) {
  const staff = staffs.find((s) => s.staffId === staffId);
  if (!staff) return;

  document.getElementById("staffIdContainer").classList.remove("hidden");
  document.getElementById("staffId").value = staff.staffId;

  // Populate modal with staff data
  document.getElementById("firstName").value = staff.firstName;
  document.getElementById("lastName").value = staff.lastName;
  document.getElementById("designation").value = staff.designation;
  document.getElementById("gender").value = staff.gender;
  document.getElementById("joinedDate").value = staff.joinedDate;
  document.getElementById("dob").value = staff.dob;
  document.getElementById("addressLine01").value = staff.addressLine01;
  document.getElementById("addressLine02").value = staff.addressLine02;
  document.getElementById("addressLine03").value = staff.addressLine03;
  document.getElementById("addressLine04").value = staff.addressLine04;
  document.getElementById("addressLine05").value = staff.addressLine05;
  document.getElementById("contactNo").value = staff.contactNo;
  document.getElementById("email").value = staff.email;
  document.getElementById("role").value = staff.role;

  // Change form mode to edit
  document.getElementById("staffForm").setAttribute("data-mode", "edit");
  document.getElementById("staffForm").setAttribute("data-edit-id", staffId);

  openModal();
}

function viewStaff(staffId) {
  const staff = staffs.find((s) => s.staffId === staffId);
  if (!staff) return;

  // Show and populate staff id
  document.getElementById("staffIdContainer").classList.remove("hidden");
  document.getElementById("staffId").value = staff.staffId;

  // Populate modal with staff data
  document.getElementById("firstName").value = staff.firstName;
  document.getElementById("lastName").value = staff.lastName;
  document.getElementById("designation").value = staff.designation;
  document.getElementById("gender").value = staff.gender;
  document.getElementById("joinedDate").value = staff.joinedDate;
  document.getElementById("dob").value = staff.dob;
  document.getElementById("addressLine01").value = staff.addressLine01;
  document.getElementById("addressLine02").value = staff.addressLine02;
  document.getElementById("addressLine03").value = staff.addressLine03;
  document.getElementById("addressLine04").value = staff.addressLine04;
  document.getElementById("addressLine05").value = staff.addressLine05;
  document.getElementById("contactNo").value = staff.contactNo;
  document.getElementById("email").value = staff.email;
  document.getElementById("role").value = staff.role;
  document.getElementById("saveStaffBtn").classList.add("hidden");

  const formElements = document.getElementById("staffForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelStaffBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

async function updateStaffInTable(staffId) {
  const staffData = getStaffData();
  try {
    const updatedStaff = await updateStaff(staffId, staffData);
    staffs = staffs.map((s) => (s.staffId === staffId ? updatedStaff : s));
    updateStaffTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to update staff");
  }
}

function getStaffData() {
  const staffId = document.getElementById("staffId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const designation = document.getElementById("designation").value;
  const gender = document.getElementById("gender").value;
  const joinedDate = document.getElementById("joinedDate").value;
  const dob = document.getElementById("dob").value;
  const addressLine01 = document.getElementById("addressLine01").value;
  const addressLine02 = document.getElementById("addressLine02").value;
  const addressLine03 = document.getElementById("addressLine03").value;
  const addressLine04 = document.getElementById("addressLine04").value;
  const addressLine05 = document.getElementById("addressLine05").value;
  const contactNo = document.getElementById("contactNo").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;
  return {
    staffId: staffId,
    firstName: firstName,
    lastName: lastName,
    designation: designation,
    gender: gender,
    joinedDate: joinedDate,
    dob: dob,
    addressLine01: addressLine01,
    addressLine02: addressLine02,
    addressLine03: addressLine03,
    addressLine04: addressLine04,
    addressLine05: addressLine05,
    contactNo: contactNo,
    email: email,
    role: role,
  };
}

// UI Updates

function updateStaffTable() {
  const tbody = document.getElementById("staffTable");
  tbody.innerHTML = staffs
    .map(
      (staff) => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${
                      staff.staffId
                    }</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${
                      staff.firstName + " " + staff.lastName
                    }</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${
                      staff.designation
                    }</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${staff.gender}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${staff.contactNo}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        staff.role === "MANAGER"
                          ? "bg-green-100 text-green-800"
                          : staff.role === "ADMINISTRATIVE"
                          ? "bg-yellow-100 text-yellow-800"
                          : staff.role === "SCIENTIST"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }">
                      ${staff.role}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                     <button data-staff-id="${
                       staff.staffId
                     }" class="view-staff-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                   <button data-staff-id="${
                     staff.staffId
                   }" class="edit-staff-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button data-staff-id="${
                      staff.staffId
                    }" class="delete-staff-btn text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>

              `
    )
    .join("");

  attachEventListeners();
}

function attachEventListeners() {
  // Add event listeners for edit buttons
  document.querySelectorAll(".edit-staff-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const staffId = e.target.dataset.staffId;
      editStaff(staffId);
    });
  });

  // Add event listeners for view buttons
  document.querySelectorAll(".view-staff-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const staffId = e.target.dataset.staffId;
      viewStaff(staffId);
    });
  });

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-staff-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const staffId = e.target.dataset.staffId;
      deleteStaffFromTable(staffId);
    });
  });
}

function updateStats() {
  const totalStaff = staffs.length;
  const managerCount = staffs.filter(
    (staff) => staff.role === "MANAGER"
  ).length;
  const otherRolesCount =
    staffs.length - staffs.filter((staff) => staff.role === "MANAGER").length;

  document.getElementById("totalStaff").textContent = totalStaff;
  document.getElementById("managerCount").textContent = managerCount;
  document.getElementById("otherRolesCount").textContent = otherRolesCount;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch staff from API
    staffs = await getAllStaff();
    updateStaffTable();
    updateStats();

    setupFieldValidation();

    // Set Event Listeners for open and close modal
    document.getElementById("addStaffBtn").addEventListener("click", openModal);
    document
      .getElementById("cancelStaffBtn")
      .addEventListener("click", closeModal);

    // Close modal when clicking outside
    document.getElementById("staffModal").addEventListener("click", (e) => {
      if (e.target.id === "staffModal") {
        closeModal();
      }
    });

    // Form submission handling
    document.getElementById("staffForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = e.target.getAttribute("data-mode");

      if (mode === "edit") {
        const id = e.target.getAttribute("data-edit-id");
        updateStaffInTable(id);
      } else {
        addStaffToTheTable();
      }
      closeModal();
    });
  } catch (error) {
    console.error(error);
    alert("Failed to fetch staff");
  }
});
