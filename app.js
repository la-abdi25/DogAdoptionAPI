//import express to initiate the application
const express = require("express");
//import db file to connect to the database
const connectToDB = require("./db");
//import cors to enable resource sharing
const cors = require("cors");
const app = express();
//user, dog, and messages routes
const userRoutes = require("./routes/userRoutes");
const dogRoutes = require("./routes/dogRoutes");
const messageRoutes = require("./routes/messageRoutes");
//use .env file for environment variables access
const dotenv = require("dotenv").config();

//used to parse the cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//db connection
connectToDB();

//middlewares
app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(dogRoutes);
app.use(messageRoutes);

//start the server to start listening on PORT 3000
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}`);
});

//export app for testing
module.exports = app;
