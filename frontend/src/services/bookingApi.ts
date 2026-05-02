import API from "./api";

export const bookTicket = (data: { name: string; email: string; ticketId: string }) =>
  API.post("/tickets/book", data);
