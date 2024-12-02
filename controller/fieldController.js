import {
  getAllFields,
  createField,
  updateField,
  deleteField,
} from "../model/fieldModel.js";
import { getAllStaff } from "../model/staffModel.js";

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
  field: "fieldCode",
  direction: "asc",
};

let fields = [];
let staffs = [];
let selectedOptions = [];

let map = null;
let marker = null;

function openModal() {
  const modal = document.getElementById("fieldModal");
  modal.classList.remove("hidden");

  //Refresh map
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

function closeModal() {
  const modal = document.getElementById("fieldModal");
  modal.classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("modalTitle").textContent = "Add Field";
  document.getElementById("fieldForm").reset();
  document.getElementById("fieldForm").removeAttribute("data-mode");
  document.getElementById("fieldForm").removeAttribute("data-edit-id");
  document.getElementById("fieldCodeContainer").classList.add("hidden");
  document.getElementById("saveFieldBtn").classList.remove("hidden");
  document
    .querySelector('[data-field="image1"] #imagePreview')
    .classList.add("hidden");
  document
    .querySelector('[data-field="image2"] #imagePreview')
    .classList.add("hidden");
  document
    .querySelector('[data-field="image1"] #uploadState')
    .classList.remove("hidden");
  document
    .querySelector('[data-field="image2"] #uploadState')
    .classList.remove("hidden");
  document.querySelector('[data-field="image1"] #previewImg').src = "";
  document.querySelector('[data-field="image2"] #previewImg').src = "";

  selectedOptions = [];

  renderSelectedOptions();
  renderOptions("");

  //Reset map
  marker.remove();
  marker = null;
  map.setView([0, 0], 2);

  document
    .getElementById("searchContainer")
    .addEventListener("click", toggleDropdown);
  const formElements = document.getElementById("fieldForm").elements;
  for (let element of formElements) {
    if (element.closest("#fieldCodeContainer")) continue;
    element.disabled = false;
  }
}

function initializeFieldSortHeaders() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    header.addEventListener("click", () => handleFieldHeaderClick(header));
  });
}

function handleFieldHeaderClick(header) {
  const field = header.getAttribute("data-field");

  if (field === currentSort.field) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.field = field;
    currentSort.direction = "asc";
  }

  updateFieldSortIndicators();
  updateFieldsTable();
}

function updateFieldSortIndicators() {
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

function setupFieldValidation() {
  const fieldNameInput = document.getElementById("fieldName");
  fieldNameInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const fieldNameRegex = /^[A-Za-z0-9\s-]+$/;
    if (!fieldNameRegex.test(this.value)) {
      this.setCustomValidity(
        "Field name can only contain letters, numbers, spaces, and hyphens"
      );
    }
  });

  const latitudeInput = document.getElementById("latitude");
  latitudeInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const latitudeRegex = /^-?([0-9]|[1-8][0-9])(\.[0-9]+)?$/;
    if (!latitudeRegex.test(this.value)) {
      this.setCustomValidity("Latitude must be a number between -90 and 90");
    }
  });

  const longitudeInput = document.getElementById("longitude");
  longitudeInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const longitudeRegex = /^-?([0-9]|[1-9][0-9]|1[0-7][0-9]|180)(\.[0-9]+)?$/;
    if (!longitudeRegex.test(this.value)) {
      this.setCustomValidity("Longitude must be a number between -180 and 180");
    }
  });

  const extentSizeInput = document.getElementById("extentSize");
  extentSizeInput.addEventListener("input", function () {
    this.setCustomValidity("");
    const extentSizeRegex = /^[0-9]+(\.[0-9]+)?$/;
    if (!extentSizeRegex.test(this.value)) {
      this.setCustomValidity("Extent size must be a positive number");
    }
  });
}

const toggleDropdown = () => {
  document.getElementById("dropdown").classList.toggle("hidden");
  document.getElementById("searchInput").focus();
};

function updateStaffDropdown() {
  const searchInput = document.getElementById("searchInput");
  const dropdown = document.getElementById("dropdown");
  const searchContainer = document.getElementById("searchContainer");
  const dropdownContainer = document.getElementById("dropdownContainer");

  // Initial render of options
  renderOptions();
  renderSelectedOptions();

  searchContainer.addEventListener("click", toggleDropdown);

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  // Search input handler
  searchInput.addEventListener("input", (e) => {
    renderOptions(e.target.value);
    if (dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("hidden");
    }
  });
}

function renderOptions(searchTerm = "") {
  const dropdown = document.getElementById("dropdown");
  const filteredOptions = staffs.filter(
    (staff) =>
      staff.staffId.toString().includes(searchTerm) &&
      !selectedOptions.find((selected) => selected.staffId === staff.staffId)
  );

  dropdown.innerHTML = filteredOptions.length
    ? filteredOptions
        .map(
          (staff) => `
        <div class="px-3 py-2 cursor-pointer hover:bg-blue-50" 
             data-id="${staff.staffId}">
          ${staff.staffId}
        </div>
      `
        )
        .join("")
    : '<div class="px-3 py-2 text-gray-500">No matching staff found</div>';

  attachOptionListeners();
}

function attachOptionListeners() {
  const dropdown = document.getElementById("dropdown");
  dropdown.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const staff = staffs.find((s) => s.staffId === el.dataset.id);
      if (staff) selectOption(staff);
    });
  });
}

function selectOption(staff) {
  if (!selectedOptions.find((opt) => opt.staffId === staff.staffId)) {
    selectedOptions.push(staff);
    renderSelectedOptions();
    renderOptions(document.getElementById("searchInput").value);
    document.getElementById("searchInput").value = "";
    document.getElementById("dropdown").classList.add("hidden");
  }
}

function renderSelectedOptions() {
  const selectedFields = document.getElementById("selectedFields");

  if (selectedOptions.length === 0) {
    selectedFields.innerHTML =
      '<div class="text-gray-400 py-1">No staff selected</div>';
    return;
  }

  selectedFields.innerHTML = selectedOptions
    .map(
      (staff) => `
      <div class="flex items-center bg-blue-100 px-3 py-1 rounded group">
        <span class="text-blue-800">${staff.staffId}</span>
        <button type="button" 
                class="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity remove-staff"
                data-staff-id="${staff.staffId}">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  attachRemoveListeners();
}
function attachRemoveListeners() {
  const selectedFields = document.getElementById("selectedFields");
  selectedFields.querySelectorAll(".remove-staff").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const staffId = button.dataset.staffId;
      removeOption(staffId);
    });
  });
}

function removeOption(staffId) {
  selectedOptions = selectedOptions.filter((opt) => opt.staffId !== staffId);
  renderSelectedOptions();
  renderOptions(document.getElementById("searchInput").value);
}

function updateFieldsTable() {
  const sortedFields = [...fields].sort((a, b) => {
    let comparison = 0;
    let aVal = "";
    let bVal = "";

    if (currentSort.field === "fieldLocation") {
      aVal = a.fieldLocation.x + a.fieldLocation.y;
      bVal = b.fieldLocation.x + b.fieldLocation.y;
    } else {
      aVal = a[currentSort.field] ?? "";
      bVal = b[currentSort.field] ?? "";
    }

    comparison = String(aVal).localeCompare(String(bVal), undefined, {
      numeric: true,
    });
    return currentSort.direction === "asc" ? comparison : -comparison;
  });

  const tbody = document.getElementById("fieldTable");
  tbody.innerHTML = sortedFields
    .map(
      (field) => `
        <tr>
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${
              field.fieldCode
            }</div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm text-gray-900">${field.fieldName}</div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm text-gray-900">
              X: ${field.fieldLocation.x}, Y: ${field.fieldLocation.y}
            </div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm text-gray-900">${field.extentSize} ha</div>
          </td>
          <td class="px-2 py-2 whitespace-nowrap">
            <div class="flex items-center justify-center">
              <img 
                src="${
                  field.fieldImage1
                    ? `data:image/png;base64,${field.fieldImage1}`
                    : "/assets/images/noImage.png"
                }"
                alt="Field Image 1"
                class="h-16 w-24 rounded-lg object-cover shadow-sm"
              />
            </div>
          </td>
          <td class="px-2 py-2 whitespace-nowrap">
            <div class="flex items-center justify-center">
              <img 
                src="${
                  field.fieldImage2
                    ? `data:image/png;base64,${field.fieldImage2}`
                    : "/assets/images/noImage.png"
                }"
                alt="Field Image 2"
                class="h-16 w-24 rounded-lg object-cover shadow-sm"
              />
            </div>
          </td>
          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
            <button data-field-code="${
              field.fieldCode
            }" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
            <button data-field-code="${
              field.fieldCode
            }" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
            <button data-field-code="${
              field.fieldCode
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
      const fieldCode = e.target.dataset.fieldCode;
      viewField(fieldCode);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const fieldCode = e.target.dataset.fieldCode;
      editField(fieldCode);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const fieldCode = e.target.dataset.fieldCode;
      deleteFieldFromTable(fieldCode);
    });
  });
}

function getFormData() {
  const fieldName = document.getElementById("fieldName").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;
  const extentSize = document.getElementById("extentSize").value;
  const fileInput1 = document.getElementById("fileInput1");
  const fileInput2 = document.getElementById("fileInput2");

  const staffIds = selectedOptions
    .map((option) => option.staffId)
    .filter(Boolean) // Remove any undefined or null values
    .join(",");

  const formData = new FormData();
  formData.append("fieldName", fieldName);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("extentSize", extentSize);
  formData.append("staffIds", staffIds);

  if (fileInput1.files && fileInput1.files[0]) {
    formData.append(
      "fieldImage1",
      fileInput1.files[0],
      fileInput1.files[0].name
    );
  } else {
    formData.append("fieldImage1", new File([], "empty-file"), "file");
  }

  if (fileInput2.files && fileInput2.files[0]) {
    formData.append(
      "fieldImage2",
      fileInput2.files[0],
      fileInput2.files[0].name
    );
  } else {
    formData.append("fieldImage2", new File([], "empty-file"), "file");
  }

  return formData;
}

function initializeMap() {
  map = L.map("map").setView([0, 0], 2);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add click handler to map
  map.on("click", function (e) {
    updateMarkerPosition(e.latlng.lat, e.latlng.lng);
    updateCoordinateInputs(e.latlng.lat, e.latlng.lng);
  });

  document
    .getElementById("latitude")
    .addEventListener("change", handleCoordinateInputChange);
  document
    .getElementById("longitude")
    .addEventListener("change", handleCoordinateInputChange);
}

function updateMarkerPosition(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }
  map.setView([lat, lng], 13);
}

function updateCoordinateInputs(lat, lng) {
  document.getElementById("latitude").value = lat.toFixed(6);
  document.getElementById("longitude").value = lng.toFixed(6);
}

function handleCoordinateInputChange() {
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);

  if (!isNaN(lat) && !isNaN(lng)) {
    updateMarkerPosition(lat, lng);
  }
}

function initializeImageUpload() {
  // Initialize both upload areas
  const uploadAreas = [
    {
      dropZone: document.querySelector('[data-field="image1"] #dropZone'),
      fileInput: document.getElementById("fileInput1"),
      uploadProgress: document.querySelector(
        '[data-field="image1"] #uploadProgress'
      ),
      progressBar: document.querySelector('[data-field="image1"] #progressBar'),
      progressText: document.querySelector(
        '[data-field="image1"] #progressText'
      ),
      uploadState: document.querySelector('[data-field="image1"] #uploadState'),
      imagePreview: document.querySelector(
        '[data-field="image1"] #imagePreview'
      ),
      previewImg: document.querySelector('[data-field="image1"] #previewImg'),
      removeImageBtn: document.querySelector(
        '[data-field="image1"] #removeImageBtn'
      ),
    },
    {
      dropZone: document.querySelector('[data-field="image2"] #dropZone'),
      fileInput: document.getElementById("fileInput2"),
      uploadProgress: document.querySelector(
        '[data-field="image2"] #uploadProgress'
      ),
      progressBar: document.querySelector('[data-field="image2"] #progressBar'),
      progressText: document.querySelector(
        '[data-field="image2"] #progressText'
      ),
      uploadState: document.querySelector('[data-field="image2"] #uploadState'),
      imagePreview: document.querySelector(
        '[data-field="image2"] #imagePreview'
      ),
      previewImg: document.querySelector('[data-field="image2"] #previewImg'),
      removeImageBtn: document.querySelector(
        '[data-field="image2"] #removeImageBtn'
      ),
    },
  ];

  // Initialize each upload area
  uploadAreas.forEach((area, index) => {
    initializeArea(area, index + 1);
  });

  function initializeArea(area) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      area.dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      area.dropZone.addEventListener(eventName, () => highlight(area), false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      area.dropZone.addEventListener(eventName, () => unhighlight(area), false);
    });

    area.dropZone.addEventListener("drop", (e) => handleDrop(e, area), false);
    area.fileInput.addEventListener(
      "change",
      (e) => handleFiles(e, area),
      false
    );
    area.removeImageBtn.addEventListener("click", (e) => {
      e.preventDefault();
      removeImage(area);
    });
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(area) {
    area.dropZone.classList.add("drag-over");
  }

  function unhighlight(area) {
    area.dropZone.classList.remove("drag-over");
  }

  function handleDrop(e, area) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleFiles({ target: { files: [files[0]] } }, area);
    }
  }

  function handleFiles(e, area) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    area.uploadProgress.classList.remove("hidden");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          area.uploadProgress.classList.add("hidden");
          showPreview(file, area);
        }, 500);
      }
      updateProgress(progress, area);
    }, 500);
  }

  function updateProgress(progress, area) {
    const percentage = Math.round(progress);
    area.progressBar.style.width = `${percentage}%`;
    area.progressText.textContent = `${percentage}%`;
  }

  function showPreview(file, area) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
      area.previewImg.src = reader.result;
      area.uploadState.classList.add("hidden");
      area.imagePreview.classList.remove("hidden");
    };
  }

  function removeImage(area) {
    const mode = document.getElementById("fieldForm").getAttribute("data-mode");
    if (mode === "edit") {
      area.previewImg.src = "";
      area.imagePreview.classList.add("hidden");
      area.uploadState.classList.remove("hidden");
    } else {
      area.uploadState.classList.remove("hidden");
      area.imagePreview.classList.add("hidden");
      area.fileInput.value = "";
      area.previewImg.src = "";
    }
  }
}

async function deleteFieldFromTable(id) {
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
        deleteField(id);
        fields = fields.filter((field) => field.fieldCode !== id);
        updateFieldsTable();
        updateStats();

        Toast.fire({
          icon: "success",
          title: "Field delete successfully",
        });
      }
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete fields",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

function editField(fieldCode) {
  document.getElementById("modalTitle").textContent = "Edit Field";

  const field = fields.find((field) => field.fieldCode === fieldCode);
  if (!field) return;

  if (field.fieldImage1) {
    document
      .querySelector('[data-field="image1"] #imagePreview')
      .classList.remove("hidden");
    document
      .querySelector('[data-field="image1"] #uploadState')
      .classList.add("hidden");
  }

  if (field.fieldImage2) {
    document
      .querySelector('[data-field="image2"] #imagePreview')
      .classList.remove("hidden");
    document
      .querySelector('[data-field="image2"] #uploadState')
      .classList.add("hidden");
  }
  document.getElementById("fieldCodeContainer").classList.remove("hidden");

  // Set form data
  document.getElementById("fieldCode").value = field.fieldCode;
  document.getElementById("fieldName").value = field.fieldName;
  document.getElementById("latitude").value = field.fieldLocation.x;
  document.getElementById("longitude").value = field.fieldLocation.y;
  document.getElementById("extentSize").value = field.extentSize;
  document.querySelector(
    '[data-field="image1"] #previewImg'
  ).src = `data:image/png;base64,${field.fieldImage1}`;
  document.querySelector(
    '[data-field="image2"] #previewImg'
  ).src = `data:image/png;base64,${field.fieldImage2}`;
  document.getElementById("fieldForm").setAttribute("data-mode", "edit");
  document
    .getElementById("fieldForm")
    .setAttribute("data-edit-id", field.fieldCode);

  // Set selected staff members
  if (field.staff && Array.isArray(field.staff)) {
    // Clear existing selections
    selectedOptions = [];

    // Add each staff member from the field's staff list
    field.staff.forEach((fieldStaff) => {
      const staffMember = staffs.find((s) => s.staffId === fieldStaff);
      if (staffMember) {
        selectedOptions.push(staffMember);
      }
    });

    // Refresh the dropdown and selected options display
    renderSelectedOptions();
    renderOptions("");
  }

  openModal();

  setTimeout(() => {
    updateMarkerPosition(field.fieldLocation.x, field.fieldLocation.y);
  }, 100);
}

function viewField(fieldCode) {
  document.getElementById("modalTitle").textContent = "View Field";

  const field = fields.find((field) => field.fieldCode === fieldCode);
  if (!field) return;

  if (field.fieldImage1) {
    document
      .querySelector('[data-field="image1"] #imagePreview')
      .classList.remove("hidden");
    document
      .querySelector('[data-field="image1"] #uploadState')
      .classList.add("hidden");
  }

  if (field.fieldImage2) {
    document
      .querySelector('[data-field="image2"] #imagePreview')
      .classList.remove("hidden");
    document
      .querySelector('[data-field="image2"] #uploadState')
      .classList.add("hidden");
  }
  document.getElementById("fieldCodeContainer").classList.remove("hidden");

  document.getElementById("fieldCode").value = field.fieldCode;
  document.getElementById("fieldName").value = field.fieldName;
  document.getElementById("latitude").value = field.fieldLocation.x;
  document.getElementById("longitude").value = field.fieldLocation.y;
  document.getElementById("extentSize").value = field.extentSize;
  document.querySelector(
    '[data-field="image1"] #previewImg'
  ).src = `data:image/png;base64,${field.fieldImage1}`;
  document.querySelector(
    '[data-field="image2"] #previewImg'
  ).src = `data:image/png;base64,${field.fieldImage2}`;
  document.getElementById("saveFieldBtn").classList.add("hidden");

  // Set selected staff members
  if (field.staff && Array.isArray(field.staff)) {
    // Clear existing selections
    selectedOptions = [];

    // Add each staff member from the field's staff list
    field.staff.forEach((fieldStaff) => {
      const staffMember = staffs.find((s) => s.staffId === fieldStaff);
      if (staffMember) {
        selectedOptions.push(staffMember);
      }
    });

    renderSelectedOptions();
    renderOptions("");
  }

  const formElements = document.getElementById("fieldForm").elements;
  const searchContainer = document.getElementById("searchContainer");
  searchContainer.removeEventListener("click", toggleDropdown);
  for (let element of formElements) {
    if (element.closest("#cancelFieldBtn")) continue;
    element.disabled = true;
  }

  openModal();

  setTimeout(() => {
    updateMarkerPosition(field.fieldLocation.x, field.fieldLocation.y);
  }, 100);
}

function updateStats() {
  const totalFields = fields.length;
  const totalArea = fields.reduce((acc, field) => acc + field.extentSize, 0);
  const activeStaff = fields.reduce(
    (acc, field) => acc + field.staff.length,
    0
  );

  document.getElementById("totalFields").textContent = totalFields;
  document.getElementById("totalArea").textContent = totalArea;
  document.getElementById("activeStaff").textContent = activeStaff;
}

async function addFieldToTheTable() {
  const formData = getFormData();
  try {
    const newField = await createField(formData);
    fields.push(newField);
    updateFieldsTable();
    updateStats();

    Toast.fire({
      icon: "success",
      title: "Field added successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to add fields",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

async function updateFieldInTheTable(editId) {
  const formData = getFormData();
  try {
    const updatedField = await updateField(editId, formData);
    fields = fields.map((field) =>
      field.fieldCode === editId ? updatedField : field
    );
    updateFieldsTable();
    updateStats();

    Toast.fire({
      icon: "success",
      title: "Field updated successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to update fields",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    fields = await getAllFields();
    staffs = await getAllStaff();

    updateFieldsTable();
    updateStaffDropdown();
    updateStats();

    setupFieldValidation();
    initializeFieldSortHeaders();

    document.getElementById("addFieldBtn").addEventListener("click", openModal);
    document
      .getElementById("cancelFieldBtn")
      .addEventListener("click", closeModal);

    initializeImageUpload();
    initializeMap();

    document.getElementById("fieldModal").addEventListener("click", (e) => {
      if (e.target.id === "fieldModal") {
        closeModal();
      }
    });

    document
      .getElementById("fieldForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const mode = e.target.getAttribute("data-mode");
        if (mode === "edit") {
          const editId = e.target.getAttribute("data-edit-id");
          await updateFieldInTheTable(editId);
        } else {
          await addFieldToTheTable();
        }
        closeModal();
      });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Fetch fields",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
});
