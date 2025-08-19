//import mongoose to connect to db
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectToDB = async () => {
  if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: ".env.test" });
  } else {
    dotenv.config();
  }
  try {
    // connect to db based on connection string
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
  } catch (err) {
    //could not connect to the db
    console.log("Could not connect to the DB");
    console.log(err);
  }
};

//export the db connection for further use
module.exports = connectToDB;
