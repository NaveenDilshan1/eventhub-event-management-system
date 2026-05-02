import API from "./api";

export const getProfile = async () => {
  const res = await API.get("/users/profile");
  return res.data;
};

export const getAllUsers = async () => {
  const res = await API.get("/users"); // Admin only
  return res.data;
};
