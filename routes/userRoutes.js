// import user controllers
const userControllers = require("../controllers/userControllers");
const express = require("express");
const { authUser } = require("../middlewares/authUsers");
const router = express.Router();

// route for registering a user
// Allow users to register with a username and password.
// Passwords should be hashed before storing in the database.
router.post("/register", userControllers.register_user_post);

// route for logging in existing users
// Enable users to log in using their credentials.
// Upon login, issue a token valid for 24 hours for subsequent authenticated requests.
router.post("/login", userControllers.login_user_post);

//route for logging out a user, used for testing purposes and simulating the Dog Adoption
//platform with different users
router.get("/logout", authUser, userControllers.logout_get);

//export user routes for further use
module.exports = router;
