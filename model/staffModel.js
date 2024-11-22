import { getToken } from '../model/authModel.js';


const STAFF_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/staff",
};


export async function getAllStaff() {
  const response = await fetch(STAFF_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch staff");
  }

  return await response.json();
}


export async function addStaff(staffData) {
  const response = await fetch(STAFF_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    throw new Error("Failed to add staff");
  }

  return await response.json();
}

export async function updateStaff(staffId, updatedData) {
  const response = await fetch(`${STAFF_ENDPOINTS.BASE}/${staffId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update staff");
  }

  return await response.json();
}

export async function deleteStaff(staffId) {
  const response = await fetch(`${STAFF_ENDPOINTS.BASE}/${staffId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === 409) {
    throw new Error("Cannot delete this item because it is referenced by other records");
  }

  if (response.status !== 204) {
    throw new Error("Failed to delete staff");
  }
}

export async function getStaffById(staffId) {
  const response = await fetch(`${STAFF_ENDPOINTS.BASE}/${staffId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch staff details");
  }

  return await response.json();
}