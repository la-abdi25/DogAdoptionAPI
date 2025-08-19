//File for handling messages requested by authenticated users
const messageModel = require("../models/MessageModel");
const { User } = require("../models/UserModel");
//import jwt for handling subsequent authenticated requests
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//route logic for reading messages users have recieved
const get_user_rec_messages = async (req, res) => {
  const user_id = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(user_id)) {
    try {
      //get the token from the cookies
      const token = req.cookies.jwt;
      //if the token exists, verify
      if (token) {
        //verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          if (err) {
            res
              .status(400)
              .json({ err: "Please log in to view messages sent to you" });
          } else {
            const user = await User.find({ _id: decodedToken.id });
            if (user) {
              //get messages sent to user in the messages collection
              const messages = await messageModel.find({ sentTo: user_id });
              if (decodedToken.id === user_id) {
                res.status(200).json({ messages });
              } else {
                //cannot view other users messages
                res.status(400).json({
                  err: "Please search for messages under your user id",
                });
              }
            } else {
              res.status(400).json({ err: "Please enter a valid user" });
            }
          }
        });
      }
      //token does not exist user must log in to proceed
      else {
        res
          .status(400)
          .json({ err: "Please log in view messages sent to you" });
      }
    } catch (err) {
      //all other errors caught here
      res.status(400).json({ err: err.message });
    }
  } else {
    //a valid document id has not been entered
    res.status(500).json({ err: "Please enter a valid document id" });
  }
};

//route logic for reading messages users have sent out
const get_user_sent_messages = async (req, res) => {
  const user_id = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(user_id)) {
    try {
      //get the token from the cookies
      const token = req.cookies.jwt;
      //if the token exists, verify
      if (token) {
        //verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          if (err) {
            res
              .status(400)
              .json({ err: "Please log in to view messages sent by you" });
          } else {
            const user = await User.find({ _id: decodedToken.id });
            //if this user exists in the database, retrieve the messages they sent out to dog owners
            if (user) {
              const messages = await messageModel.find({ sentBy: user_id });
              if (decodedToken.id === user_id) {
                res.status(200).json({ messages });
              } else {
                //cannot view other users sent messages
                res.status(400).json({
                  err: "Please search for messages sent by you under your user id",
                });
              }
            } else {
              res.status(400).json({ err: "Please enter a valid user" });
            }
          }
        });
      }
      //token does not exist user must log in to proceed
      else {
        res
          .status(400)
          .json({ err: "Please log in to view messages sent by you" });
      }
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  } else {
    // a valid document id has not been entered
    res.status(500).json({ err: "Please enter a valid document id" });
  }
};
//export message routes for further use
module.exports = { get_user_rec_messages, get_user_sent_messages };
