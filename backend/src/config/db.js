const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    (await mongoose.connect(process.env.MONGO_URI),
      console.log("DB connected Successfully"));
  } catch (err) {
    console.log("Error while connection", err);
  }
};
module.exports = dbConnection;
