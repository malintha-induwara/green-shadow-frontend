import {
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "../model/equipmentModel.js";

import { getAllStaff } from "../model/staffModel.js";
import { getAllFields } from "../model/fieldModel.js";

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
  field: "equipmentId",
  direction: "asc",
};

let equipment = [];
let staffs = [];
let fields = [];

// Modal Control
function openModal() {
  const modal = document.getElementById("equipmentModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("equipmentModal");
  modal.classList.add("hidden");
  resetForm();
}

// Form Control
function resetForm() {
  document.getElementById("modalTitle").textContent = "Add Equipment";
  document.getElementById("equipmentForm").reset();
  document.getElementById("equipmentForm").removeAttribute("data-mode");
  document.getElementById("equipmentForm").removeAttribute("data-edit-id");
  document.getElementById("equipmentIdContainer").classList.add("hidden");
  document.getElementById("saveEquipmentBtn").classList.remove("hidden");

  const formElements = document.getElementById("equipmentForm").elements;
  for (let element of formElements) {
    if (element.closest("#equipmentIdContainer")) continue;
    element.disabled = false;
  }
}

function initializeEquipmentSortHeaders() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    header.addEventListener("click", () => handleEquipmentHeaderClick(header));
  });
}

function handleEquipmentHeaderClick(header) {
  const field = header.getAttribute("data-field");

  if (field === currentSort.field) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.field = field;
    currentSort.direction = "asc";
  }

  updateEquipmentSortIndicators();
  updateEquipmentTable();
}

function updateEquipmentSortIndicators() {
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

async function addEquipmentToTable() {
  try {
    const equipmentData = getEquipmentData();
    let response = await addEquipment(equipmentData);
    equipment.push(response);
    updateEquipmentTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "Equipment added successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Add equipment",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

async function deleteEquipmentFromTable(id) {
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
        deleteEquipment(id);
        equipment = equipment.filter((item) => item.equipmentId !== id);
        updateEquipmentTable();
        updateStats();
        Toast.fire({
          icon: "success",
          title: "Equipment deleted successfully",
        });
      }
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete equipment",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

function editEquipment(equipmentId) {
  const item = equipment.find((item) => item.equipmentId === equipmentId);
  if (!item) return;

  document.getElementById("modalTitle").textContent = "Edit Equipment";
  document.getElementById("equipmentIdContainer").classList.remove("hidden");
  document.getElementById("equipmentId").value = item.equipmentId;
  document.getElementById("equipmentName").value = item.name;
  document.getElementById("equipmentType").value = item.equipmentType;
  document.getElementById("field").value = item.field;
  document.getElementById("staff").value = item.staff || "null";
  document.getElementById("status").value = item.status;

  // Change form mode to edit
  document.getElementById("equipmentForm").setAttribute("data-mode", "edit");
  document
    .getElementById("equipmentForm")
    .setAttribute("data-edit-id", equipmentId);

  openModal();
}

function viewEquipment(equipmentId) {
  const item = equipment.find((item) => item.equipmentId === equipmentId);
  if (!item) return;

  document.getElementById("modalTitle").textContent = "View Equipment";
  document.getElementById("equipmentIdContainer").classList.remove("hidden");
  document.getElementById("equipmentId").value = item.equipmentId;
  document.getElementById("equipmentName").value = item.name;
  document.getElementById("equipmentType").value = item.equipmentType;
  document.getElementById("field").value = item.field;
  document.getElementById("staff").value = item.staff || "null";
  document.getElementById("status").value = item.status;
  document.getElementById("saveEquipmentBtn").classList.add("hidden");

  const formElements = document.getElementById("equipmentForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelEquipmentBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

async function updateEquipmentInTable(equipmentId) {
  const equipmentData = getEquipmentData();
  try {
    const updatedEquipment = await updateEquipment(equipmentId, equipmentData);
    equipment = equipment.map((item) =>
      item.equipmentId === equipmentId ? updatedEquipment : item
    );
    updateEquipmentTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "Equipment updated successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to update equipment",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

function getEquipmentData() {
  const equipmentId = document.getElementById("equipmentId").value;
  const name = document.getElementById("equipmentName").value;
  const equipmentType = document.getElementById("equipmentType").value;
  const field =
    document.getElementById("field").value === "null"
      ? null
      : document.getElementById("field").value;
  const staff =
    document.getElementById("staff").value === "null"
      ? null
      : document.getElementById("staff").value;
  const status = document.getElementById("status").value;

  return {
    equipmentId: equipmentId,
    name: name,
    equipmentType: equipmentType,
    field: field,
    staff: staff,
    status: status,
  };
}

// UI Updates
function updateStaffDropdown() {
  const staff = document.getElementById("staff");
  staff.innerHTML = `
      <option value="null">Select Staff</option>
      ${staffs
        .map(
          (staff) =>
            `<option value="${staff.staffId}">${staff.staffId}</option>`
        )
        .join("")}
    `;
}

function updateFieldsDropdown() {
  const select = document.getElementById("field");
  select.innerHTML = `
      <option value="null">Select Field</option>
      ${fields
        .map(
          (field) =>
            `<option value="${field.fieldCode}">${field.fieldCode}</option>`
        )
        .join("")}
    `;
}

function updateEquipmentTable() {
  const sortedEquipment = [...equipment].sort((a, b) => {
    let comparison = 0;
    const aVal =
      a[currentSort.field] === null ? "" : String(a[currentSort.field]);
    const bVal =
      b[currentSort.field] === null ? "" : String(b[currentSort.field]);

    comparison = aVal.localeCompare(bVal);

    return currentSort.direction === "asc" ? comparison : -comparison;
  });
  const tbody = document.getElementById("equipmentTable");
  tbody.innerHTML = sortedEquipment
    .map(
      (item) => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${
            item.equipmentId
          }</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${item.name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${item.equipmentType}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${
            item.field === null ? "No" : item.field
          }</div>
        </td>
        <td class="px-4 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${
            item.staff === null ? "No" : item.staff
          }</div>
        </td>
        <td class="px-4 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${
              item.status === "AVAILABLE"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }">
            ${item.status}
          </span>
        </td>
        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
          <button data-equipment-id="${
            item.equipmentId
          }" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
          <button data-equipment-id="${
            item.equipmentId
          }" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
          <button data-equipment-id="${
            item.equipmentId
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
      const equipmentId = e.target.dataset.equipmentId;
      viewEquipment(equipmentId);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const equipmentId = e.target.dataset.equipmentId;
      editEquipment(equipmentId);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const equipmentId = e.target.dataset.equipmentId;
      deleteEquipmentFromTable(equipmentId);
    });
  });
}

function updateStats() {
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(
    (item) => item.status === "AVAILABLE"
  ).length;
  const unavailableEquipment = equipment.filter(
    (item) => item.status === "UNAVAILABLE"
  ).length;

  document.getElementById("totalEquipment").textContent = totalEquipment;
  document.getElementById("availableEquipment").textContent =
    availableEquipment;
  document.getElementById("unavailableEquipment").textContent =
    unavailableEquipment;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    equipment = await getAllEquipment();
    staffs = await getAllStaff();
    fields = await getAllFields();

    updateStaffDropdown();
    updateFieldsDropdown();
    updateEquipmentTable();
    updateStats();

    initializeEquipmentSortHeaders();

    document
      .getElementById("addEquipmentBtn")
      .addEventListener("click", openModal);
    document
      .getElementById("cancelEquipmentBtn")
      .addEventListener("click", closeModal);

    // Close modal when clicking outside
    document.getElementById("equipmentModal").addEventListener("click", (e) => {
      if (e.target.id === "equipmentModal") {
        closeModal();
      }
    });

    // Form submission handling
    document.getElementById("equipmentForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = e.target.getAttribute("data-mode");

      if (mode === "edit") {
        const id = e.target.getAttribute("data-edit-id");
        updateEquipmentInTable(id);
      } else {
        addEquipmentToTable();
      }
      closeModal();
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Fetch equipment data",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
});
