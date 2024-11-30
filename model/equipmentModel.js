import { getToken } from "./authModel.js";

const EQUIPMENT_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/equipment",
};

export async function getAllEquipment() {
  const response = await fetch(EQUIPMENT_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return await response.json();
}

export async function addEquipment(equipmentData) {
  const response = await fetch(EQUIPMENT_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipmentData),
  });

  if (!response.ok) {
    throw new Error("Failed to add equipment");
  }

  return await response.json();
}

export async function updateEquipment(equipmentId, updatedData) {
  const response = await fetch(`${EQUIPMENT_ENDPOINTS.BASE}/${equipmentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update equipment");
  }
  return await response.json();
}

export async function deleteEquipment(equipmentId) {
  const response = await fetch(`${EQUIPMENT_ENDPOINTS.BASE}/${equipmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status !== 204) {
    throw new Error("Failed to delete equipment");
  }
}

export async function getEquipmentById(equipmentId) {
  const response = await fetch(`${EQUIPMENT_ENDPOINTS.BASE}/${equipmentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch equipment details");
  }

  return await response.json();
}
