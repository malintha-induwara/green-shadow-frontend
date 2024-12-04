import { getToken } from '../model/authModel.js';

const CROP_DETAILS_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/cropDetails",
};


export async function getAllCropDetails() {
  const response = await fetch(CROP_DETAILS_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch crop details");
  }

  return await response.json();
}


export async function addCropDetail(cropData) {
  const response = await fetch(CROP_DETAILS_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: cropData,
  });

  if (!response.ok) {
    throw new Error("Failed to add crop detail");
  }

  return await response.json();
}


export async function updateCropDetail(cropId, cropData) {
  const response = await fetch(`${CROP_DETAILS_ENDPOINTS.BASE}/${cropId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: cropData,
  });

  if (!response.ok) {
    throw new Error("Failed to update crop detail");
  }

  return await response.json();
}

export async function deleteCropDetail(cropId) {
  const response = await fetch(`${CROP_DETAILS_ENDPOINTS.BASE}/${cropId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });


  if (response.status === 409) {
    throw new Error("Cannot delete this item because it is referenced by other records");
  }
  
  if (response.status !== 204) {
    throw new Error("Failed to delete crop detail");
  }
}
