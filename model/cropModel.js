import { getToken } from '../model/authModel.js';


const CROP_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/crop",
};



export async function getAllCrops() {
    const response = await fetch(CROP_ENDPOINTS.BASE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch crops");
    }
  
    return await response.json();
  }



  export async function addCrop(cropData) {
    const response = await fetch(CROP_ENDPOINTS.BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: cropData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to add crop");
    }
  
    return await response.json();
  }


export async function updateCrop(cropId, cropData) {
  const response = await fetch(`${CROP_ENDPOINTS.BASE}/${cropId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: cropData,
  });

  if (!response.ok) {
    throw new Error("Failed to update field");
  }
  return await response.json();
}
  


  export async function deleteCrop(cropId) {
    const response = await fetch(`${CROP_ENDPOINTS.BASE}/${cropId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  
    if (!response.status === 204) {
      throw new Error("Failed to delete crop");
    }
  }
  