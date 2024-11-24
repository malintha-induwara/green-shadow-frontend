import { getToken } from "../model/authModel.js";

const FIELD_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/field",
};

export async function getAllFields() {
  const response = await fetch(FIELD_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch fields");
  }

  return await response.json();
}


export async function createField(fieldData) {
  const response = await fetch(FIELD_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: fieldData,
  });

  if (!response.ok) {
    throw new Error("Failed to create field");
  }

  return await response.json();
}

export async function updateField(fieldId, fieldData) {
  const response = await fetch(`${FIELD_ENDPOINTS.BASE}/${fieldId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: fieldData,
  });

  if (!response.ok) {
    throw new Error("Failed to update field");
  }
  return await response.json();
}


export async function deleteField(fieldId) {
  const response = await fetch(`${FIELD_ENDPOINTS.BASE}/${fieldId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete field");
  }
}