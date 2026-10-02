const mongoose = require("mongoose");

let isConnecting = null;

const dbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return isConnecting;
  }

  try {
    isConnecting = mongoose.connect(process.env.MONGO_URI);
    await isConnecting;
    console.log("DB connected Successfully");
  } catch (err) {
    console.log("Error while connection", err);
  } finally {
    isConnecting = null;
  }
};
module.exports = dbConnection;
