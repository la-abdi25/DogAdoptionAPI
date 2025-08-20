//File for handling messages requested by authenticated users
const messageModel = require("../models/MessageModel");
const { User } = require("../models/UserModel");
//import jwt for handling subsequent authenticated requests
const jwt = require("jsonwebtoken");

//route logic for reading messages users have recieved
const get_user_rec_messages = async (req, res) => {
  try {
    //pagination
    const pages = req.query.p || 0;
    const recMessagesPerPage = 2;
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if the token exists, verify
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Please log in to view messages sent to you" });
        } else {
          const user = await User.findById(decodedToken.id);
          if (user) {
            //get messages sent to user in the messages collection
            const messages = await messageModel
              .find({ sentTo: user._id })
              .skip(pages * recMessagesPerPage)
              .limit(recMessagesPerPage);

            return res.status(200).json({ messages });
          } else {
            return res.status(400).json({ err: "Not a valid user" });
          }
        }
      });
    }
    //token does not exist user must log in to proceed
    else {
      return res
        .status(400)
        .json({ err: "Please log in view messages sent to you" });
    }
  } catch (err) {
    //all other errors caught here
    return res.status(400).json({ err: err.message });
  }
};

//route logic for reading messages users have sent out
const get_user_sent_messages = async (req, res) => {
  try {
    //pagination
    const pages = req.query.p || 0;
    const sentMessagesPerPage = 2;
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if the token exists, verify
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Please log in to view messages sent by you" });
        } else {
          const user = await User.findById(decodedToken.id);
          if (user) {
            //get messages sent by user in the messages collection
            const messages = await messageModel
              .find({ sentBy: user._id })
              .skip(pages * sentMessagesPerPage)
              .limit(sentMessagesPerPage);

            return res.status(200).json({ messages });
          } else {
            return res.status(400).json({ err: "Not a valid user" });
          }
        }
      });
    }
    //token does not exist user must log in to proceed
    else {
      return res
        .status(400)
        .json({ err: "Please log in view messages sent by you" });
    }
  } catch (err) {
    //all other errors caught here
    return res.status(400).json({ err: err.message });
  }
};
//export message routes for further use
module.exports = { get_user_rec_messages, get_user_sent_messages };
