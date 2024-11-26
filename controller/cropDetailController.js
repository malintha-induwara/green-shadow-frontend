import {
  getAllCropDetails,
  addCropDetail,
  updateCropDetail,
  deleteCropDetail,
} from "../model/cropDetailModel.js";
import { getAllStaff } from "../model/staffModel.js";
import { getAllFields } from "../model/fieldModel.js";
import { getAllCrops } from "../model/cropModel.js";

let cropDetailLogs = [];
let staff = [];
let fields = [];
let crops = [];

let selectedStaff = [];
let selectedFields = [];
let selectedCrops = [];

function openModal() {
  const modal = document.getElementById("logModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("logModal");
  modal.classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("logForm").reset();
  document.getElementById("logForm").removeAttribute("data-mode");
  document.getElementById("logForm").removeAttribute("data-edit-id");
  document.getElementById("logCodeContainer").classList.add("hidden");
  document.getElementById("saveLogBtn").classList.remove("hidden");
  document.getElementById("imagePreview").classList.add("hidden");
  document.getElementById("uploadState").classList.remove("hidden");
  document.getElementById("previewImg").src = "";

  document
    .getElementById("staffSearchContainer")
    .addEventListener("click", toggleStaffDropdown);
  document
    .getElementById("fieldSearchContainer")
    .addEventListener("click", toggleFieldDropdown);
  document
    .getElementById("cropSearchContainer")
    .addEventListener("click", toggleCropDropdown);

  const formElements = document.getElementById("logForm").elements;
  for (let element of formElements) {
    if (element.closest("#logCodeContainer")) continue;
    element.disabled = false;
  }
}

const toggleStaffDropdown = () => {
  document.getElementById("staffDropdown").classList.toggle("hidden");
  document.getElementById("staffSearchInput").focus();
};

function updateStaffDropdown() {
  const searchInput = document.getElementById("staffSearchInput");
  const dropdown = document.getElementById("staffDropdown");
  const searchContainer = document.getElementById("staffSearchContainer");
  const dropdownContainer = document.getElementById("staffDropdownContainer");

  renderStaffOptions();
  renderSelectedStaffOptions();

  searchContainer.addEventListener("click", toggleStaffDropdown);

  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  searchInput.addEventListener("input", (e) => {
    renderStaffOptions(e.target.value);
    if (dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("hidden");
    }
  });
}

function renderStaffOptions(searchTerm = "") {
  const dropdown = document.getElementById("staffDropdown");
  const filteredOptions = staff.filter(
    (staffMember) =>
      staffMember.staffId.includes(searchTerm) &&
      !selectedStaff.find(
        (selected) => selected.staffId === staffMember.staffId
      )
  );

  dropdown.innerHTML = filteredOptions.length
    ? filteredOptions
        .map(
          (staffMember) => `
        <div class="px-3 py-2 cursor-pointer hover:bg-blue-50" 
             data-id="${staffMember.staffId}">
          ${staffMember.staffId}
        </div>
      `
        )
        .join("")
    : '<div class="px-3 py-2 text-gray-500">No matching staff found</div>';

  attachStaffOptionListeners();
}

function attachStaffOptionListeners() {
  const dropdown = document.getElementById("staffDropdown");
  dropdown.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const staffMember = staff.find((s) => s.staffId === el.dataset.id);
      if (staffMember) selectStaffOption(staffMember);
    });
  });
}

function selectStaffOption(staffMember) {
  if (!selectedStaff.find((opt) => opt.staffId === staffMember.staffId)) {
    selectedStaff.push(staffMember);
    renderSelectedStaffOptions();
    renderStaffOptions(document.getElementById("staffSearchInput").value);
    document.getElementById("staffSearchInput").value = "";
    document.getElementById("staffDropdown").classList.add("hidden");
  }
}

function renderSelectedStaffOptions() {
  const selectedStaffDiv = document.getElementById("selectedStaff");

  if (selectedStaff.length === 0) {
    selectedStaffDiv.innerHTML =
      '<div class="text-gray-400 py-1">No staff selected</div>';
    return;
  }

  selectedStaffDiv.innerHTML = selectedStaff
    .map(
      (staffMember) => `
      <div class="flex items-center bg-blue-100 px-3 py-1 rounded group">
        <span class="text-blue-800">${staffMember.staffId}</span>
        <button type="button" 
                class="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity remove-staff"
                data-staff-id="${staffMember.staffId}">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  attachStaffRemoveListeners();
}

function attachStaffRemoveListeners() {
  const selectedStaffDiv = document.getElementById("selectedStaff");
  selectedStaffDiv.querySelectorAll(".remove-staff").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const staffId = button.dataset.staffId;
      removeStaffOption(staffId);
    });
  });
}

function removeStaffOption(staffId) {
  selectedStaff = selectedStaff.filter((opt) => opt.staffId !== staffId);
  renderSelectedStaffOptions();
  renderStaffOptions(document.getElementById("staffSearchInput").value);
}

// Field Dropdown Functions
const toggleFieldDropdown = () => {
  document.getElementById("fieldDropdown").classList.toggle("hidden");
  document.getElementById("fieldSearchInput").focus();
};

function updateFieldDropdown() {
  const searchInput = document.getElementById("fieldSearchInput");
  const dropdown = document.getElementById("fieldDropdown");
  const searchContainer = document.getElementById("fieldSearchContainer");
  const dropdownContainer = document.getElementById("fieldDropdownContainer");

  renderFieldOptions();
  renderSelectedFieldOptions();

  searchContainer.addEventListener("click", toggleFieldDropdown);

  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  searchInput.addEventListener("input", (e) => {
    renderFieldOptions(e.target.value);
    if (dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("hidden");
    }
  });
}

function renderFieldOptions(searchTerm = "") {
  const dropdown = document.getElementById("fieldDropdown");
  const filteredOptions = fields.filter(
    (field) =>
      field.fieldCode.includes(searchTerm) &&
      !selectedFields.find((selected) => selected.fieldCode === field.fieldCode)
  );

  dropdown.innerHTML = filteredOptions.length
    ? filteredOptions
        .map(
          (field) => `
        <div class="px-3 py-2 cursor-pointer hover:bg-blue-50" 
             data-id="${field.fieldCode}">
          ${field.fieldCode}
        </div>
      `
        )
        .join("")
    : '<div class="px-3 py-2 text-gray-500">No matching fields found</div>';

  attachFieldOptionListeners();
}

function attachFieldOptionListeners() {
  const dropdown = document.getElementById("fieldDropdown");
  dropdown.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const field = fields.find((f) => f.fieldCode === el.dataset.id);
      if (field) selectFieldOption(field);
    });
  });
}

function selectFieldOption(field) {
  if (!selectedFields.find((opt) => opt.fieldCode === field.fieldCode)) {
    selectedFields.push(field);
    renderSelectedFieldOptions();
    renderFieldOptions(document.getElementById("fieldSearchInput").value);
    document.getElementById("fieldSearchInput").value = "";
    document.getElementById("fieldDropdown").classList.add("hidden");
  }
}

function renderSelectedFieldOptions() {
  const selectedFieldsDiv = document.getElementById("selectedFields");

  if (selectedFields.length === 0) {
    selectedFieldsDiv.innerHTML =
      '<div class="text-gray-400 py-1">No fields selected</div>';
    return;
  }

  selectedFieldsDiv.innerHTML = selectedFields
    .map(
      (field) => `
      <div class="flex items-center bg-blue-100 px-3 py-1 rounded group">
        <span class="text-blue-800">${field.fieldCode}</span>
        <button type="button" 
                class="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity remove-field"
                data-field-id="${field.fieldCode}">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  attachFieldRemoveListeners();
}

function attachFieldRemoveListeners() {
  const selectedFieldsDiv = document.getElementById("selectedFields");
  selectedFieldsDiv.querySelectorAll(".remove-field").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const fieldId = button.dataset.fieldId;
      removeFieldOption(fieldId);
    });
  });
}

function removeFieldOption(fieldId) {
  selectedFields = selectedFields.filter((opt) => opt.fieldCode !== fieldId);
  renderSelectedFieldOptions();
  renderFieldOptions(document.getElementById("fieldSearchInput").value);
}

// Crop Dropdown Functions
const toggleCropDropdown = () => {
  document.getElementById("cropDropdown").classList.toggle("hidden");
  document.getElementById("cropSearchInput").focus();
};

function updateCropDropdown() {
  const searchInput = document.getElementById("cropSearchInput");
  const dropdown = document.getElementById("cropDropdown");
  const searchContainer = document.getElementById("cropSearchContainer");
  const dropdownContainer = document.getElementById("cropDropdownContainer");

  renderCropOptions();
  renderSelectedCropOptions();

  searchContainer.addEventListener("click", toggleCropDropdown);

  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  searchInput.addEventListener("input", (e) => {
    renderCropOptions(e.target.value);
    if (dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("hidden");
    }
  });
}

function renderCropOptions(searchTerm = "") {
  const dropdown = document.getElementById("cropDropdown");
  const filteredOptions = crops.filter(
    (crop) =>
      crop.cropCode.includes(searchTerm) &&
      !selectedCrops.find((selected) => selected.cropCode === crop.cropCode)
  );

  dropdown.innerHTML = filteredOptions.length
    ? filteredOptions
        .map(
          (crop) => `
        <div class="px-3 py-2 cursor-pointer hover:bg-blue-50" 
             data-id="${crop.cropCode}">
          ${crop.cropCode}
        </div>
      `
        )
        .join("")
    : '<div class="px-3 py-2 text-gray-500">No matching crops found</div>';

  attachCropOptionListeners();
}

function attachCropOptionListeners() {
  const dropdown = document.getElementById("cropDropdown");
  dropdown.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const crop = crops.find((c) => c.cropCode === el.dataset.id);
      if (crop) selectCropOption(crop);
    });
  });
}

function selectCropOption(crop) {
  if (!selectedCrops.find((opt) => opt.cropCode === crop.cropCode)) {
    selectedCrops.push(crop);
    renderSelectedCropOptions();
    renderCropOptions(document.getElementById("cropSearchInput").value);
    document.getElementById("cropSearchInput").value = "";
    document.getElementById("cropDropdown").classList.add("hidden");
  }
}

function renderSelectedCropOptions() {
  const selectedCropsDiv = document.getElementById("selectedCrops");

  if (selectedCrops.length === 0) {
    selectedCropsDiv.innerHTML =
      '<div class="text-gray-400 py-1">No crops selected</div>';
    return;
  }

  selectedCropsDiv.innerHTML = selectedCrops
    .map(
      (crop) => `
      <div class="flex items-center bg-blue-100 px-3 py-1 rounded group">
        <span class="text-blue-800">${crop.cropCode}</span>
        <button type="button" 
                class="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity remove-crop"
                data-crop-id="${crop.cropCode}">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  attachCropRemoveListeners();
}

function attachCropRemoveListeners() {
  const selectedCropsDiv = document.getElementById("selectedCrops");
  selectedCropsDiv.querySelectorAll(".remove-crop").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const cropId = button.dataset.cropId;
      removeCropOption(cropId);
    });
  });
}

function removeCropOption(cropId) {
  selectedCrops = selectedCrops.filter((opt) => opt.cropCode !== cropId);
  renderSelectedCropOptions();
  renderCropOptions(document.getElementById("cropSearchInput").value);
}

function updateLogTable() {
  const tbody = document.getElementById("logTable");
  tbody.innerHTML = cropDetailLogs
    .map(
      (cropDetailLog) => `
                  <tr>
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">${
                        cropDetailLog.logCode
                      }</div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${
                        cropDetailLog.logDate
                      }</div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${
                        cropDetailLog.logDetail
                      }</div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="flex items-center justify-center">
                        <img 
                          src="${
                            cropDetailLog.observedImage
                              ? `data:image/png;base64,${cropDetailLog.observedImage}`
                              : "/assets/images/noImage.png"
                          }" 
                          alt="Observed Image"
                          class="h-16 w-24 rounded-lg object-cover shadow-sm"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      <button data-log-code="${
                        cropDetailLog.logCode
                      }" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                      <button data-log-code="${
                        cropDetailLog.logCode
                      }" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button data-log-code="${
                        cropDetailLog.logCode
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
      const logCode = e.target.dataset.logCode;
      viewField(logCode);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const logCode = e.target.dataset.logCode;
      editLog(logCode);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const logCode = e.target.dataset.logCode;
      deleteLogFromTable(logCode);
    });
  });
}

function getFormData() {
  const logDate = document.getElementById("logDate").value;
  const logDetail = document.getElementById("logDetail").value;
  const fileInput = document.getElementById("fileInput");

  const staffId = selectedStaff
    .map((staff) => staff.staffId)
    .filter(Boolean)
    .join(",");
  const fieldCode = selectedFields
    .map((field) => field.fieldCode)
    .filter(Boolean)
    .join(",");
  const cropCode = selectedCrops
    .map((crop) => crop.cropCode)
    .filter(Boolean)
    .join(",");

  const formData = new FormData();
  formData.append("logDate", logDate);
  formData.append("logDetail", logDetail);
  formData.append("staffIds", staffId);
  formData.append("fieldCodes", fieldCode);
  formData.append("cropCodes", cropCode);

  if (fileInput.files && fileInput.files[0]) {
    formData.append(
      "observedImage",
      fileInput.files[0],
      fileInput.files[0].name
    );
  } else {
    formData.append("observedImage", new File([], "empty-file"), "file");
  }

  return formData;
}

function initializeImageUpload() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const uploadState = document.getElementById("uploadState");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const removeImageBtn = document.getElementById("removeImageBtn");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  dropZone.addEventListener("drop", handleDrop, false);
  fileInput.addEventListener("change", handleFiles, false);
  removeImageBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission
    removeImage();
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    dropZone.classList.add("drag-over");
  }

  function unhighlight(e) {
    dropZone.classList.remove("drag-over");
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleFiles({ target: { files: [files[0]] } }); // Only take the first file
    }
  }

  function handleFiles(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Show upload progress
    uploadProgress.classList.remove("hidden");

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          uploadProgress.classList.add("hidden");
          showPreview(file);
        }, 500);
      }
      updateProgress(progress);
    }, 500);
  }

  function updateProgress(progress) {
    const percentage = Math.round(progress);
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
  }

  function showPreview(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
      previewImg.src = reader.result;
      uploadState.classList.add("hidden");
      imagePreview.classList.remove("hidden");
    };
  }

  function removeImage() {
    const mode = document.getElementById("logForm").getAttribute("data-mode");
    if (mode === "edit") {
      // Reset image preview for edit mode
      document.getElementById("previewImg").src = "";
      document.getElementById("imagePreview").classList.add("hidden");
      document.getElementById("uploadState").classList.remove("hidden");
    } else {
      // Reset image preview for create mode
      document.getElementById("uploadState").classList.remove("hidden");
      document.getElementById("imagePreview").classList.add("hidden");
      document.getElementById("fileInput").value = "";
      document.getElementById("previewImg").src = "";
    }
  }
}

async function deleteLogFromTable(id) {
  try {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteCropDetail(id);
      cropDetailLogs = cropDetailLogs.filter(
        (cropLog) => cropLog.logCode !== id
      );
      updateLogTable();
      updateStats();
    }
  } catch (error) {
    console.error(error);
    alert("Failed to delete crop");
  }
}

function editLog(logCode) {
  const log = cropDetailLogs.find((log) => log.logCode === logCode);

  if (!log) return;

  if (log.observedImage) {
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("uploadState").classList.add("hidden");
  }

  document.getElementById("logCodeContainer").classList.remove("hidden");

  document.getElementById("logCode").value = log.logCode;
  document.getElementById("logDate").value = log.logDate;
  document.getElementById("logDetail").value = log.logDetail;
  document.getElementById(
    "previewImg"
  ).src = `data:image/png;base64,${log.observedImage}`;
  document.getElementById("logForm").setAttribute("data-mode", "edit");
  document.getElementById("logForm").setAttribute("data-edit-id", log.logCode);

  if (log.staffIds && Array.isArray(log.staffIds)) {
    selectedStaff = [];

    log.staffIds.forEach((logStaff) => {
      const staffMember = staff.find((s) => s.staffId === logStaff);
      if (staffMember) {
        selectedStaff.push(staffMember);
      }
    });

    renderSelectedStaffOptions();
    renderStaffOptions("");
  }

  if (log.fieldCodes && Array.isArray(log.fieldCodes)) {
    selectedFields = [];

    log.fieldCodes.forEach((logField) => {
      const field = fields.find((f) => f.fieldCode === logField);
      if (field) {
        selectedFields.push(field);
      }
    });

    renderSelectedFieldOptions();
    renderFieldOptions("");
  }

  if (log.cropCodes && Array.isArray(log.cropCodes)) {
    selectedCrops = [];

    log.cropCodes.forEach((logCrop) => {
      const crop = crops.find((c) => c.cropCode === logCrop);
      if (crop) {
        selectedCrops.push(crop);
      }
    });

    renderSelectedCropOptions();
    renderCropOptions("");
  }

  openModal();
}

function viewField(logCode) {
  const log = cropDetailLogs.find((log) => log.logCode === logCode);

  if (!log) return;

  if (log.observedImage) {
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("uploadState").classList.add("hidden");
  }

  document.getElementById("logCodeContainer").classList.remove("hidden");

  document.getElementById("logCode").value = log.logCode;
  document.getElementById("logDate").value = log.logDate;
  document.getElementById("logDetail").value = log.logDetail;
  document.getElementById(
    "previewImg"
  ).src = `data:image/png;base64,${log.observedImage}`;
  document.getElementById("logForm").setAttribute("data-mode", "edit");
  document.getElementById("logForm").setAttribute("data-edit-id", log.logCode);

  if (log.staffIds && Array.isArray(log.staffIds)) {
    selectedStaff = [];

    log.staffIds.forEach((logStaff) => {
      const staffMember = staff.find((s) => s.staffId === logStaff);
      if (staffMember) {
        selectedStaff.push(staffMember);
      }
    });

    renderSelectedStaffOptions();
    renderStaffOptions("");
  }

  if (log.fieldCodes && Array.isArray(log.fieldCodes)) {
    selectedFields = [];

    log.fieldCodes.forEach((logField) => {
      const field = fields.find((f) => f.fieldCode === logField);
      if (field) {
        selectedFields.push(field);
      }
    });

    renderSelectedFieldOptions();
    renderFieldOptions("");
  }

  if (log.cropCodes && Array.isArray(log.cropCodes)) {
    selectedCrops = [];

    log.cropCodes.forEach((logCrop) => {
      const crop = crops.find((c) => c.cropCode === logCrop);
      if (crop) {
        selectedCrops.push(crop);
      }
    });

    renderSelectedCropOptions();
    renderCropOptions("");
  }

  const fieldSearchContainer = document.getElementById("fieldSearchContainer");
  fieldSearchContainer.removeEventListener("click", toggleFieldDropdown);

  const staffSearchContainer = document.getElementById("staffSearchContainer");
  staffSearchContainer.removeEventListener("click", toggleStaffDropdown);

  const cropSearchContainer = document.getElementById("cropSearchContainer");
  cropSearchContainer.removeEventListener("click", toggleCropDropdown);

  const formElements = document.getElementById("logForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelLogBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

function updateStats() {
  const totalLogs = cropDetailLogs.length;
  const todaysLogs = cropDetailLogs.filter((log) => {
    const logDate = new Date(log.logDate);
    const today = new Date();
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const activeFields = new Set(
    staff.flatMap(staffMember => staffMember.fields)
  ).size;

  document.getElementById("totalLogs").textContent = totalLogs;
  document.getElementById("todayLogs").textContent = todaysLogs;
  document.getElementById("activeFields").textContent = activeFields;
}

async function addLogToTheTable() {
  const formData = getFormData();
  try {
    const newLog = await addCropDetail(formData);
    cropDetailLogs.push(newLog);
    updateLogTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to add log");
  }
}

async function updateLogInTheTable(editId) {
  const formData = getFormData();
  try {
    const updatedLog = await updateCropDetail(editId, formData);
    cropDetailLogs = cropDetailLogs.map((log) =>
      log.logCode === editId ? updatedLog : log
    );
    updateLogTable();
    updateStats();
  } catch (error) {
    console.error(error);
    alert("Failed to update log");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    cropDetailLogs = await getAllCropDetails();
    staff = await getAllStaff();
    fields = await getAllFields();
    crops = await getAllCrops();

    updateLogTable();
    updateStaffDropdown();
    updateFieldDropdown();
    updateCropDropdown();
    updateStats();

    //Set Event Listeners for open and close modal
    document.getElementById("addLogBtn").addEventListener("click", openModal);
    document
      .getElementById("cancelLogBtn")
      .addEventListener("click", closeModal);

    initializeImageUpload();

    document.getElementById("logModal").addEventListener("click", (e) => {
      if (e.target.id === "logModal") {
        closeModal();
      }
    });

    document.getElementById("logForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const mode = e.target.getAttribute("data-mode");
      if (mode === "edit") {
        const editId = e.target.getAttribute("data-edit-id");
        await updateLogInTheTable(editId);
      } else {
        await addLogToTheTable();
      }
      closeModal();
    });
  } catch (error) {
    console.error(error);
    alert("Failed to fetch data");
  }
});
