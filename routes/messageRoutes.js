//File for viewing messages
const messageControllers = require("../controllers/messageControllers");
const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authUsers");

//route to retrieve messages sent to the user
router.get("/recmessages", authUser, messageControllers.get_user_rec_messages);
//route to retrieve messages sent by the user to the dog owners
router.get(
  "/sentmessages",
  authUser,
  messageControllers.get_user_sent_messages
);
//export message routes for further use
module.exports = router;
