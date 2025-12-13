// src/api/authService.js
import api from "./api/axiosClient";

export async function register(name, email, password) {
  const res = await api.post("/register", { name, email, password });
  const { accessToken, user } = res.data;
  localStorage.setItem("accessToken", accessToken);
  return user;
}

export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  const { accessToken, user } = res.data;
  localStorage.setItem("accessToken", accessToken);
  return user;
}

export async function logout() {
  await api.post("/logout");
  localStorage.removeItem("accessToken");
}

export async function getCurrentUser() {
  const res = await api.get("/user");
  return res.data;
}