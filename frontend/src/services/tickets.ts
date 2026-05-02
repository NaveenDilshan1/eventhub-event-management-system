import API from "./api";

export const getTickets = async () => {
  const res = await API.get("/tickets");
  return res.data;
};

export const getTicketById = async (id: string) => {
  const res = await API.get(`/tickets/${id}`);
  return res.data;
};
