//  User Model, specifically handling login and register scenarios
const mongoose = require("mongoose");

//  import bcrypt for authentication and authorization
const bcrypt = require("bcrypt");

//  user Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a valid username"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a valid password"],
    minlength: [6, "Please enter a minimum character length of 6"],
  },
});

//  this function runs before saving document to database to ensure
//  password is hashed before storing data in the database
userSchema.pre("save", async function (next) {
  try {
    const saltPassword = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, saltPassword);
    next();
  } catch (err) {
    console.log(err.message);
  }
});
//  logging in user
userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    //  if user exists, compare the password user entered versus the password stored in the database
    const authUser = await bcrypt.compare(password, user.password);
    if (authUser) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

//  export user model for further use
const User = mongoose.model("User", userSchema);
module.exports = {
  User,
};
