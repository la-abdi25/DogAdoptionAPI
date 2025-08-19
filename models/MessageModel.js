const mongoose = require("mongoose");

//  messageSchema, handling messages sent by adopters to owners
//  a thank-you message for the original owner
//  messages collection
const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sentTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    sentBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    sentToName: {
      type: String,
    },
    sentByName: {
      type: String,
    },
  },
  { timestamps: true }
);

//  export message model for further use
const Messages = mongoose.model("Messages", messageSchema);
module.exports = Messages;
