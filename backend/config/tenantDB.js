import mongoose from "mongoose";

const connections = {}; // cache tenant connections

export const getTenantDB = async (dbName) => {
  if (connections[dbName]) return connections[dbName];

  const baseUri = process.env.MONGO_URI.split("?")[0];

  const conn = mongoose.createConnection(`${baseUri}/${dbName}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  conn.on("connected", () => console.log(`Tenant DB connected: ${dbName}`));
  conn.on("error", (err) => console.error(`Tenant DB error (${dbName}):`, err));

  connections[dbName] = conn;
  return conn;
};
