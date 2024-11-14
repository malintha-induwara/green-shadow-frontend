import { getToken } from '../model/authModel.js';

const USER_ENDPOINTS = {
  BASE: "http://localhost:8080/api/v1/user",
};

export async function addUser(userData) {
  const response = await fetch(USER_ENDPOINTS.BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to save user");
  }

  return await response.json();
}

export async function getAllUsers() {
  const response = await fetch(USER_ENDPOINTS.BASE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

export async function updateUser(userId, updatedData) {
  const response = await fetch(`${USER_ENDPOINTS.BASE}/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  
  return response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`${USER_ENDPOINTS.BASE}/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status !== 204) {
    throw new Error("Failed to delete user");
  }
}
