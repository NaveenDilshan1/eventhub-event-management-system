import API from "./api";

export const registerUser = async (data: any) => {
  const res = await API.post("/auth/register", data);
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const loginUser = async (data: any) => {
  const res = await API.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
