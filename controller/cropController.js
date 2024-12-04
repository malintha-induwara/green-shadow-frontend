import {
  getAllCrops,
  deleteCrop,
  addCrop,
  updateCrop,
} from "../model/cropModel.js";
import { getAllFields } from "../model/fieldModel.js";

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
  field: "cropCode",
  direction: "asc",
};
let crops = [];
let fields = [];

function openModal() {
  const modal = document.getElementById("cropModal");
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("cropModal");
  modal.classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("modalTitle").textContent = "Add Crop";
  document.getElementById("cropForm").reset();
  document.getElementById("cropForm").removeAttribute("data-mode");
  document.getElementById("cropForm").removeAttribute("data-edit-id");
  document.getElementById("cropCodeContainer").classList.add("hidden");
  document.getElementById("saveCropBtn").classList.remove("hidden");
  document.getElementById("imagePreview").classList.add("hidden");
  document.getElementById("uploadState").classList.remove("hidden");
  document.getElementById("previewImg").src = "";

  const formElements = document.getElementById("cropForm").elements;
  for (let element of formElements) {
    if (element.closest("#cropCodeContainer")) continue;
    element.disabled = false;
  }
}

function initializeSearch() {
  document.getElementById('tableSearch').addEventListener('input', (e) => {
    updateCropsTable(e.target.value);
  });
}


function initializeSortHeaders() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    header.addEventListener("click", () => handleHeaderClick(header));
  });
}

function handleHeaderClick(header) {
  const field = header.getAttribute("data-field");

  if (field === currentSort.field) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.field = field;
    currentSort.direction = "asc";
  }

  updateSortIndicators();
  updateCropsTable();
}

function updateSortIndicators() {
  const headers = document.querySelectorAll("th[data-sortable]");
  headers.forEach((header) => {
    const field = header.getAttribute("data-field");

    const existingIcon = header.querySelector(".sort-icon");
    if (existingIcon) {
      existingIcon.remove();
    }

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

async function addCropToTheTable() {
  const formData = getFormData();
  try {
    const cropData = await addCrop(formData);
    crops.push(cropData);
    updateCropsTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "Crop added successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to add crop",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
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

function updateCropsTable(searchQuery = '') {
  const sortedCrops = [...crops]
    .filter(crop => {
      if (!searchQuery) return true;
      
      const searchFields = [
        crop.cropCode,
        crop.cropCommonName,
        crop.category,
        crop.cropSeason,
        crop.field
      ];
      
      return searchFields.some(field => 
        String(field).toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      const aVal = a[currentSort.field] === null ? "" : String(a[currentSort.field]);
      const bVal = b[currentSort.field] === null ? "" : String(b[currentSort.field]);
      
      comparison = aVal.localeCompare(bVal);
      
      return currentSort.direction === "asc" ? comparison : -comparison;
    });

  const tbody = document.getElementById("cropTable");
  tbody.innerHTML = sortedCrops
    .map(
      (crop) => `
                <tr>
                  <td class="px-6 py-2 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${crop.cropCode}</div>
                  </td>
                  <td class="px-6 py-2 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${crop.cropCommonName}</div>
                  </td>
                  <td class="px-6 py-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <img 
                         src="${crop.image ? `data:image/png;base64,${crop.image}` : `/assets/images/noImage.png`}" 
                        alt="${crop.cropCommonName}"
                        class="h-16 w-24 rounded-lg object-cover shadow-sm"
                      />
                    </div>
                  </td>
                  <td class="px-6 py-2 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${crop.category}</div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${crop.cropSeason === "Spring"
                          ? "bg-green-100 text-green-800"
                          : crop.cropSeason === "Summer"
                          ? "bg-yellow-100 text-yellow-800"
                          : crop.cropSeason === "Fall"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"}">
                      ${crop.cropSeason}
                    </span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${crop.field === null ? "No" : crop.field}</div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <button data-crop-code="${crop.cropCode}" class="view-btn text-yellow-600 hover:text-yellow-900 mr-3">View</button>
                    <button data-crop-code="${crop.cropCode}" class="edit-btn text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button data-crop-code="${crop.cropCode}" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
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
      viewCrop(cropCode);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const cropCode = e.target.dataset.cropCode;
      editCrop(cropCode);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const cropCode = e.target.dataset.cropCode;
      deleteCropFromTable(cropCode);
    });
  });
}

function getFormData() {
  const cropCommonName = document.getElementById("cropCommonName").value;
  const cropScientificName =
    document.getElementById("cropScientificName").value;
  const cropCategory = document.getElementById("cropCategory").value;
  const cropSeason = document.getElementById("cropSeason").value;
  const cropField = document.getElementById("field").value;
  const fileInput = document.getElementById("fileInput");

  const formData = new FormData();
  formData.append("cropCommonName", cropCommonName);
  formData.append("cropScientificName", cropScientificName);
  formData.append("category", cropCategory);
  formData.append("cropSeason", cropSeason);
  formData.append("field", cropField);

  if (fileInput.files && fileInput.files[0]) {
    formData.append("image", fileInput.files[0], fileInput.files[0].name);
  } else {
    formData.append("image", new File([], "empty-file"), "file");
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
    e.preventDefault();
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
    const mode = document.getElementById("cropForm").getAttribute("data-mode");
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

async function deleteCropFromTable(id) {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteCrop(id);
      crops = crops.filter((crop) => crop.cropCode !== id);
      updateCropsTable();
      updateStats();
      
      Toast.fire({
        icon: "success",
        title: "Crop deleted successfully",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete crop",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

async function editCrop(cropCode) {
  const crop = crops.find((crop) => crop.cropCode === cropCode);
  if (!crop) return;

  if (crop.image) {
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("uploadState").classList.add("hidden");
  }

  document.getElementById("modalTitle").textContent = "Edit Crop";
  document.getElementById("cropCodeContainer").classList.remove("hidden");
  document.getElementById("cropCode").value = crop.cropCode;
  document.getElementById("cropCommonName").value = crop.cropCommonName;
  document.getElementById("cropScientificName").value = crop.cropScientificName;
  document.getElementById("cropCategory").value = crop.category;
  document.getElementById("cropSeason").value = crop.cropSeason;
  document.getElementById("field").value = crop.field;
  document.getElementById(
    "previewImg"
  ).src = `data:image/png;base64,${crop.image}`;
  document.getElementById("cropForm").setAttribute("data-mode", "edit");
  document
    .getElementById("cropForm")
    .setAttribute("data-edit-id", crop.cropCode);

  openModal();
}

function viewCrop(cropCode) {
  const crop = crops.find((crop) => crop.cropCode === cropCode);
  if (!crop) return;

  if (crop.image) {
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("uploadState").classList.add("hidden");
  }

  document.getElementById("modalTitle").textContent = "View Crop";
  document.getElementById("cropCodeContainer").classList.remove("hidden");
  document.getElementById("cropCode").value = crop.cropCode;
  document.getElementById("cropCommonName").value = crop.cropCommonName;
  document.getElementById("cropScientificName").value = crop.cropScientificName;
  document.getElementById("cropCategory").value = crop.category;
  document.getElementById("cropSeason").value = crop.cropSeason;
  document.getElementById("field").value = crop.field;
  document.getElementById(
    "previewImg"
  ).src = `data:image/png;base64,${crop.image}`;
  document.getElementById("saveCropBtn").classList.add("hidden");

  const formElements = document.getElementById("cropForm").elements;
  for (let element of formElements) {
    if (element.closest("#cancelCropBtn")) continue;
    element.disabled = true;
  }

  openModal();
}

function updateStats() {
  const totalCrops = crops.length;
  const month = new Date().getMonth();
  const currentSeason =
    month >= 2 && month <= 4
      ? "Spring"
      : month >= 5 && month <= 7
      ? "Summer"
      : month >= 8 && month <= 10
      ? "Fall"
      : "Winter";
  const activeFields = crops.filter((crop) => crop.field !== null).length;

  document.getElementById("totalCrops").textContent = totalCrops;
  document.getElementById("currentSeason").textContent = currentSeason;
  document.getElementById("activeFields").textContent = activeFields;
}

async function updateCropInTheTable(editId) {
  const formData = getFormData();
  try {
    const updatedCrop = await updateCrop(editId, formData);
    crops = crops.map((crop) =>
      crop.cropCode === editId ? updatedCrop : crop
    );
    updateCropsTable();
    updateStats();
    Toast.fire({
      icon: "success",
      title: "Log updated successfully",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to update crop",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    crops = await getAllCrops();
    fields = await getAllFields();

    updateFieldsDropdown();
    updateCropsTable();
    updateStats();

    initializeSortHeaders();
    initializeSearch();

    document.getElementById("addCropBtn").addEventListener("click", openModal);
    document
      .getElementById("cancelCropBtn")
      .addEventListener("click", closeModal);

    initializeImageUpload();

    document.getElementById("cropModal").addEventListener("click", (e) => {
      if (e.target.id === "cropModal") {
        closeModal();
      }
    });

    document
      .getElementById("cropForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const mode = e.target.getAttribute("data-mode");
        if (mode === "edit") {
          const editId = e.target.getAttribute("data-edit-id");
          await updateCropInTheTable(editId);
        } else {
          await addCropToTheTable();
        }
        closeModal();
      });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to Fetch crop data",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
});
