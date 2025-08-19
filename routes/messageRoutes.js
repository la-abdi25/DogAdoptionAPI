//File for viewing messages 
const messageControllers = require("../controllers/messageControllers");
const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authUsers");

//route to retrieve messages sent to the user, must use id of logged in user to view
router.get(
  "/recmessages/:id",
  authUser,
  messageControllers.get_user_rec_messages
);
//route to retrieve messages sent by the user to the dog owner, must use id of logged in user to view
router.get(
  "/sentmessages/:id",
  authUser,
  messageControllers.get_user_sent_messages
);
//export message routes for further use
module.exports = router;
