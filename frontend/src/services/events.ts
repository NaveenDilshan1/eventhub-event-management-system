import API from "./api";

export const getEvents = async () => {
  const res = await API.get("/events");
  return res.data;
};

export const getEventById = async (id: string) => {
  const res = await API.get(`/events/${id}`);
  return res.data;
};

export const createEvent = async (data: any) => {
  const res = await API.post("/events", data); // Organizer/Admin only
  return res.data;
};
