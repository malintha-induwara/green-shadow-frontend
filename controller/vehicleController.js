import {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "../model/vehicleModel.js";
import { getAllStaff } from "../model/staffModel.js";


//Toast Configs
const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
})

let currentSort = {
  field: 'vehicleCode',
  direction: 'asc'
};
let vehicles = [];
let staffs = [];

function openModal() {
  const modal = document.getElementById("vehicleModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("vehicleModal");
  modal.classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("vehicleForm").reset();
  document.getElementById("vehicleForm").removeAttribute("data-mode");
  document.getElementById("vehicleForm").removeAttribute("data-edit-id");
  document.getElementById("vehicleCodeContainer").classList.add("hidden");
  document.getElementById("saveVehicleBtn").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = "Add Vehicle";

  const formElements = document.getElementById("vehicleForm").elements;
  for (let element of formElements) {
    if (element.closest("#vehicleCodeContainer")) continue;
    element.disabled = false;
  }
}


function initializeSearch() {
  document.getElementById('tableSearch').addEventListener('input', (e) => {
    updateVehiclesTable(e.target.value);
  });
}


function initializeSortHeaders() {
  const headers = document.querySelectorAll('th[data-sortable]');
  headers.forEach(header => {
    header.addEventListener('click', () => handleHeaderClick(header));
  });
}

function handleHeaderClick(header) {
  const field = header.getAttribute('data-field');
  
  if (field === currentSort.field) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.direction = 'asc';
  }

  updateSortIndicators();
  updateVehiclesTable();
}


function updateSortIndicators() {
  const headers = document.querySelectorAll('th[data-sortable]');
  headers.forEach(header => {
    const field = header.getAttribute('data-field');
    
    const existingIcon = header.querySelector('.sort-icon');
    if (existingIcon) {
      existingIcon.remove();
    }
    
    if (field === currentSort.field) {
      const icon = document.createElement('span');
      icon.className = 'sort-icon ml-1 inline-block';
      
      icon.innerHTML = currentSort.direction === 'asc' 
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
    Toast.fire({
      icon: 'success',
      title: 'Vehicle added successfully'
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Add vehicle",
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
}

async function deleteVehicleFromTable(id) {
  try {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        deleteVehicle(id);
        vehicles = vehicles.filter((vehicle) => vehicle.vehicleCode !== id);
        updateVehiclesTable();
        updateStats();

        Toast.fire({
          icon: 'success',
          title: 'Vehicle deleted successfully'
        });
      }
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete vehicle",
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
}

function editVehicle(vehicleCode) {
  const vehicle = vehicles.find(
    (vehicle) => vehicle.vehicleCode === vehicleCode
  );
  if (!vehicle) return;

  document.getElementById("modalTitle").textContent = "Edit Vehicle";
  document.getElementById("vehicleCodeContainer").classList.remove("hidden");
  document.getElementById("vehicleCode").value = vehicle.vehicleCode;

  document.getElementById("licensePlateNumber").value =vehicle.licensePlateNumber;
  document.getElementById("vehicleCategory").value = vehicle.vehicleCategory;
  document.getElementById("fuelType").value = vehicle.fuelType;
  document.getElementById("staff").value = vehicle.staff;
  document.getElementById("status").value = vehicle.status;
  document.getElementById("remarks").value = vehicle.remarks || "";

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

  document.getElementById("modalTitle").textContent = "View Vehicle";
  document.getElementById("vehicleCodeContainer").classList.remove("hidden");
  document.getElementById("vehicleCode").value = vehicle.vehicleCode;

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

    Toast.fire({
      icon: 'success',
      title: 'Vehicle updated successfully'
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to update vehicle",
      icon: "error",
      confirmButtonColor: "#d33"
    });
  
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

function updateVehiclesTable(searchQuery = '') {
  const sortedVehicles = [...vehicles]
    .filter(vehicle => {
      if (!searchQuery) return true;
      
      const searchFields = [
        vehicle.vehicleCode,
        vehicle.licensePlateNumber,
        vehicle.vehicleCategory,
        vehicle.fuelType,
        vehicle.staff,
        vehicle.status
      ];
      
      return searchFields.some(field => 
        String(field).toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      const aVal = String(a[currentSort.field]);
      const bVal = String(b[currentSort.field]);
      
      comparison = aVal.localeCompare(bVal);
      
      return currentSort.direction === 'asc' ? comparison : -comparison;
    });

  const tbody = document.getElementById("vehicleTable");
  tbody.innerHTML = sortedVehicles
    .map(
      (vehicle) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${vehicle.vehicleCode}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${vehicle.licensePlateNumber}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${vehicle.vehicleCategory}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${vehicle.fuelType}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${vehicle.staff === null ? "No" : vehicle.staff}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${vehicle.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : vehicle.status === "UNAVAILABLE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"}">
                    ${vehicle.status}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button data-vehicle-code="${vehicle.vehicleCode}" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                  <button data-vehicle-code="${vehicle.vehicleCode}" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button data-vehicle-code="${vehicle.vehicleCode}" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
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

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const vehicleCode = e.target.dataset.vehicleCode;
      editVehicle(vehicleCode);
    });
  });

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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    vehicles = await getAllVehicles();
    staffs = await getAllStaff();

    updateStaffDropdown();
    updateVehiclesTable();
    updateStats();

    setupFieldValidation();
    initializeSortHeaders();

    initializeSearch();

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
    Swal.fire({
      title: "Error!",
      text: "Failed to Fetch vehicle data",
      icon: "error",
      confirmButtonColor: "#d33"
    });
  }
});
