import { getToken } from '../model/authModel.js';


const VEHICLE_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/vehicle",
};


export async function getAllVehicles() {
  const response = await fetch(VEHICLE_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  return await response.json();
}

export async function addVehicle(vehicleData) {
  const response = await fetch(VEHICLE_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify(vehicleData),
  });

  if (!response.ok) {
    throw new Error("Failed to add vehicle");
  }

  return await response.json();
}

export async function updateVehicle(vehicleId, updatedData) {
  const response = await fetch(`${VEHICLE_ENDPOINTS.BASE}/${vehicleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update vehicle");
  }
  return await response.json();
}

export async function deleteVehicle(vehicleId) {
  const response = await fetch(`${VEHICLE_ENDPOINTS.BASE}/${vehicleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.status === 204) {
    throw new Error("Failed to delete vehicle");
  }
}

export async function getVehicleById(vehicleId) {
  const response = await fetch(`${VEHICLE_ENDPOINTS.BASE}/${vehicleId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vehicle details");
  }

  return await response.json();
}

