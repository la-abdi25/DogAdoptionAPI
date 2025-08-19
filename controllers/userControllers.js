//import data models and bcrypt for authentication
const bcrypt = require("bcrypt");
const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");

// create a token for logged in users
// maxAge valid for 24hours/1 day time in seconds
const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

//handle Errors
//handles errors found in the catch blocks
const handleErrors = (err) => {
  let errors = { username: "", password: "" };
  if (err.message === "incorrect username") {
    errors.username = "Please enter the correct username";
  }
  if (err.message === "incorrect password") {
    errors.password = "Please enter the correct password";
  }
  //duplicate usernames
  if (err.code === 11000) {
    errors.username =
      "Username already exists, Please enter a different username";
    return errors;
  }

  //validation errors, username and password
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach((error) => {
      errors[error.properties.path] = error.properties.message;
    });
  }
  return errors;
};

// handle registeration
// Allow users to register with a username and password.
// Passwords should be hashed before storing in the database.
const register_user_post = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    await User.create({ username, password });
    return res
      .status(201)
      .json({ msg: `Successfully registered user id ${username}` });
  } catch (err) {
    //Could not create user
    const errors = handleErrors(err);
    return res.status(400).json({ err: errors, msg: "Error occured" });
  }
};

//handle logging in user
const login_user_post = async (req, res) => {
  const errors = {};
  const { username, password } = req.body || {};

  if (!username) {
    errors.username = "Please enter a username";
  }

  if (!password) {
    errors.password = "Please enter a password";
  }

  if (!username || !password) {
    return res.status(400).json({ errors });
  }

  try {
    //handle login logic, based on the username and password
    const user = await User.login(username, password);
    //issue a token for each user valid for 24 hours
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    return res
      .status(200)
      .json({ user: user._id, msg: `Logged in ${username} successfully` });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
};

//user logging out logic, deleting corresponding jwt token
const logout_get = (req, res) => {
  try {
    //delete the jwt cookie
    res.cookie("jwt", "", { maxAge: 1 });
    return res.status(200).json({ msg: `Successfully logged out` });
  } catch (err) {
    return res.status(400).json({ err: "Could not logout" });
  }
};

//export user controller functions
module.exports = {
  logout_get,
  login_user_post,
  register_user_post,
};
