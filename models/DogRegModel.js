const mongoose = require("mongoose");
//  dog registration Schema, handle
//  Authenticated users can register dogs awaiting adoption, providing a name and a brief description.

const dogRegSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
    lowercase: true,
  },
  adopted: {
    type: Boolean,
  },
  registeredBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  adoptedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});
//  export dog registration model for further use
const RegisteredDog = mongoose.model("registereddog", dogRegSchema);
module.exports = { RegisteredDog };
