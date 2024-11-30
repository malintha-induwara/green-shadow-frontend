import {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "../model/vehicleModel.js";

import { getAllStaff } from "../model/staffModel.js";

let vehicles = [];
let staffs = [];

// Modal Control
function openModal() {
  const modal = document.getElementById("vehicleModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("vehicleModal");
  modal.classList.add("hidden");
  resetForm();
}

// Form Control
function resetForm() {
  document.getElementById("vehicleForm").reset();
  document.getElementById("vehicleForm").removeAttribute("data-mode");
  document.getElementById("vehicleForm").removeAttribute("data-edit-id");
  document.getElementById("vehicleCodeContainer").classList.add("hidden");
  document.getElementById("saveVehicleBtn").classList.remove("hidden");

  const formElements = document.getElementById("vehicleForm").elements;
  for (let element of formElements) {
    if (element.closest("#vehicleCodeContainer")) continue;
    element.disabled = false;
  }
}


function setupFieldValidation() {
  const licensePlateInput = document.getElementById("licensePlateNumber");

  licensePlateInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const licensePlateRegex = /^[A-Z0-9-]+$/;
    if (!licensePlateRegex.test(this.value)) {
      this.setCustomValidity(
        "License plate can only contain letters, numbers, and hyphens"
      );
    }
  });
}

async function addVehicleToTheTable() {
  try {
    const vehicleData = getVehicleData();

    let response = await addVehicle(vehicleData);

    vehicles.push(response);
    updateVehiclesTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to add vehicle");
  }
}

async function deleteVehicleFromTable(id) {
  try {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      await deleteVehicle(id);
      vehicles = vehicles.filter((vehicle) => vehicle.vehicleCode !== id);
      updateVehiclesTable();
      updateStats();
    }
  } catch (error) {
    console.error(error);
    alert("Failed to delete vehicle");
  }
}

function editVehicle(vehicleCode) {
  const vehicle = vehicles.find(
    (vehicle) => vehicle.vehicleCode === vehicleCode
  );
  if (!vehicle) return;

  document.getElementById("vehicleCodeContainer").classList.remove("hidden");
  document.getElementById("vehicleCode").value = vehicle.vehicleCode;

  // Populate modal with vehicle data
  document.getElementById("licensePlateNumber").value =vehicle.licensePlateNumber;
  document.getElementById("vehicleCategory").value = vehicle.vehicleCategory;
  document.getElementById("fuelType").value = vehicle.fuelType;
  document.getElementById("staff").value = vehicle.staff;
  document.getElementById("status").value = vehicle.status;
  document.getElementById("remarks").value = vehicle.remarks || "";

  // Change form mode to edit
  document.getElementById("vehicleForm").setAttribute("data-mode", "edit");
  document
    .getElementById("vehicleForm")
    .setAttribute("data-edit-id", vehicleCode);

  openModal();
}

function viewVehicle(vehicleCode) {
  const vehicle = vehicles.find(
    (vehicle) => vehicle.vehicleCode === vehicleCode
  );
  if (!vehicle) return;

  // Show and populate vehicle code
  document.getElementById("vehicleCodeContainer").classList.remove("hidden");
  document.getElementById("vehicleCode").value = vehicle.vehicleCode;

  // Populate modal with vehicle data
  document.getElementById("licensePlateNumber").value =
    vehicle.licensePlateNumber;
  document.getElementById("vehicleCategory").value = vehicle.vehicleCategory;
  document.getElementById("fuelType").value = vehicle.fuelType;
  document.getElementById("staff").value = vehicle.staff;
  document.getElementById("status").value = vehicle.status;
  document.getElementById("remarks").value = vehicle.remarks || "";
  document.getElementById("saveVehicleBtn").classList.add("hidden");

  const formElements = document.getElementById("vehicleForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelVehicleBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

async function updateVehicleOfTable(vehicleCode) {
  const vehicleData = getVehicleData();
  try {
    const updatedVehicle = await updateVehicle(vehicleCode, vehicleData);
    vehicles = vehicles.map((vehicle) => 
      vehicle.vehicleCode === vehicleCode ? updatedVehicle : vehicle
  );
    updateVehiclesTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to update vehicle");
  }
}

function getVehicleData() {
  const vehicleCode = document.getElementById("vehicleCode").value;
  const licensePlateNumber =
    document.getElementById("licensePlateNumber").value;
  const vehicleCategory = document.getElementById("vehicleCategory").value;
  const fuelType = document.getElementById("fuelType").value;
  const staff =
    document.getElementById("staff").value === "null"
      ? null
      : document.getElementById("staff").value;
  const status = document.getElementById("status").value;
  const remarks = document.getElementById("remarks").value;
  return {
    vehicleCode:vehicleCode,
   licensePlateNumber: licensePlateNumber,
   vehicleCategory:  vehicleCategory,
   fuelType:  fuelType,
   staff: staff,
   status:   status,
   remarks:  remarks,
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

function updateVehiclesTable() {
  const tbody = document.getElementById("vehicleTable");
  tbody.innerHTML = vehicles
    .map(
      (vehicle) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${
                    vehicle.vehicleCode
                  }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${
                    vehicle.licensePlateNumber
                  }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${
                    vehicle.vehicleCategory
                  }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${vehicle.fuelType}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${
                    vehicle.staff === null ? "No" : vehicle.staff
                  }</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      vehicle.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "UNAVAILABLE"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }">
                    ${vehicle.status}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                 <button data-vehicle-code="${
                   vehicle.vehicleCode
                 }" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                 <button data-vehicle-code="${
                   vehicle.vehicleCode
                 }" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button data-vehicle-code="${
                    vehicle.vehicleCode
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
      const vehicleCode = e.target.dataset.vehicleCode;
      viewVehicle(vehicleCode);
    });
  });

  // Add event listeners for edit buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const vehicleCode = e.target.dataset.vehicleCode;
      editVehicle(vehicleCode);
    });
  });

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const vehicleCode = e.target.dataset.vehicleCode;
      deleteVehicleFromTable(vehicleCode);
    });
  });
}

function updateStats() {
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "AVAILABLE"
  ).length;
  const unavailableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "UNAVAILABLE"
  ).length;

  document.getElementById("totalVehicles").textContent = totalVehicles;
  document.getElementById("availableVehicles").textContent = availableVehicles;
  document.getElementById("unavailableVehicles").textContent =
    unavailableVehicles;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch vehicles from API
    vehicles = await getAllVehicles();
    staffs = await getAllStaff();

    updateStaffDropdown();
    updateVehiclesTable();
    updateStats();

    setupFieldValidation();

    //Set Event Listenres for open and close modal
    document
      .getElementById("addVehicleBtn")
      .addEventListener("click", openModal);
    document
      .getElementById("cancelVehicleBtn")
      .addEventListener("click", closeModal);

    // Close modal when clicking outside
    document.getElementById("vehicleModal").addEventListener("click", (e) => {
      if (e.target.id === "vehicleModal") {
        closeModal();
      }
    });

    // Form submission handling
    document.getElementById("vehicleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = e.target.getAttribute("data-mode");

      if (mode === "edit") {
        const id = e.target.getAttribute("data-edit-id");
        updateVehicleOfTable(id);
      } else {
        addVehicleToTheTable();
      }
      closeModal();
    });
  } catch (error) {
    console.error(error);
    alert("Failed to fetch vehicles");
  }
});
