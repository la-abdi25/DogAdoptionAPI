//handle register request via Register Dog Model
const { RegisteredDog } = require("../models/DogRegModel");
const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");
const Messages = require("../models/MessageModel");
//import mongoose for validation checks
const mongoose = require("mongoose");

//getting registered dogs based on logged in user
const register_dogs_get = async (req, res) => {
  const user_id = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(user_id)) {
    //pagination
    const pages = req.query.p || 0;
    const status = req.query.adopted;
    const registeredDogsPerPage = 2;
    try {
      const user = await User.findById(user_id);
      //if user exists, proceed
      if (user) {
        if (pages && status) {
          const registerDogs = await RegisteredDog.find({
            registeredBy: user_id,
            adopted: status,
          })
            .skip(pages * registeredDogsPerPage)
            .limit(registeredDogsPerPage);
          res.status(200).json({ registerDogs });
        } else {
          const registerDogs = await RegisteredDog.find({
            registeredBy: user_id,
          });
          return res.status(200).json({ registerDogs });
        }
      } else {
        console.log(err);
      }
    } catch (err) {
      return res.status(400).json({ err: err.message });
    }
  } else {
    //a valid document id has not been entered
    return res.status(500).json({ err: "Please enter a valid document id" });
  }
};

//registering dogs
const register_dogs_post = async (req, res) => {
  try {
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if token exists
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Please log in to register your dog" });
        } else {
          const user = await User.findById(decodedToken.id);
          //if the user exists, proceed
          if (user) {
            const { name, description } = req.body;
            //create dog in the database
            const dog = await RegisteredDog.create({
              name,
              description,
              adopted: false,
              adoptedBy: null,
              registeredBy: user,
            });

            return res
              .status(201)
              .json({ msg: `Successfully registered ${name}` });
          } else {
            return res
              .status(400)
              .json({ err: `Not a valid user in the database` });
          }
        }
      });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

// Removing Dogs: Owners can remove their registered dogs from the platform
// unless the dog has been adopted. Users cannot remove dogs registered by others.
const register_dogs_delete = async (req, res) => {
  const dog = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(dog)) {
    try {
      //get the token from the cookies
      const token = req.cookies.jwt;
      //if token exists
      if (token) {
        //verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          if (err) {
            return res.status(400).json({
              err: "Please log in to delete your dog from the platform",
            });
          } else {
            const dogInfo = await RegisteredDog.findById(dog);
            const user = await User.findById(decodedToken.id);
            if (
              dogInfo.registeredBy.equals(user._id) &&
              dogInfo.adopted === false
            ) {
              //user is verified and can proceed to delete dog from the database
              await RegisteredDog.deleteOne(
                { _id: dogInfo._id } // Filter dog by id
              );
              return res.status(200).json({
                msg: `Successfully deleted ${dogInfo.name} at id ${dog}`,
              });
            } else {
              if (dogInfo.adopted === true) {
                return res.status(400).json({
                  err: `Cannot delete a dog that has already been adopted`,
                });
              }
              if (!dogInfo.registeredBy.equals(user._id)) {
                return res.status(400).json({
                  err: `Cannot delete a dog you did not register`,
                });
              }
            }
          }
        });
      } else {
        //token does not exist cannot verify user
        return res
          .status(400)
          .json({ err: `Not a valid user in the database` });
      }
    } catch (err) {
      return res.status(400).json({ err: err.message });
    }
  } else {
    //not a valid document id
    return res.status(500).json({ err: "Please enter a valid document id" });
  }
};

//adopting dogs route
const adopt_dogs_put = async (req, res) => {
  const dog = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(dog)) {
    try {
      //get the token from the cookies
      const token = req.cookies.jwt;
      //check to see if user sent a thank you message to the original dog owner in
      //the request body
      const message = req.body.message;
      if (!message) {
        return res.status(500).json({
          err: "Please send a thank you message to the original dog owner",
        });
      }
      //if token exists
      if (token) {
        //verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          if (err) {
            return res
              .status(400)
              .json({ err: "Please log in to adopt a dog" });
          } else {
            const dogInfo = await RegisteredDog.findById(dog);
            const user = await User.findById(decodedToken.id);
            const sentToUser = await User.findById(dogInfo.registeredBy);
            //a dog already adopted cannot be adopted again, and users cannot adopt dogs they registered.
            if (
              !dogInfo.registeredBy.equals(user._id) &&
              dogInfo.adopted === false
            ) {
              //send message to the original dog owner
              await Messages.create({
                message,
                sentTo: dogInfo.registeredBy,
                sentBy: user._id,
                sentToName: sentToUser.username,
                sentByName: user.username,
              });
              await RegisteredDog.updateOne(
                { _id: dogInfo._id }, // Filter to match dog id
                { $set: { adopted: true, adoptedBy: user._id } }
              );
              return res.status(200).json({
                msg: `Successfully adopted ${dog} and sent message to ${dogInfo.registeredBy}`,
              });
            } else {
              if (dogInfo.registeredBy.equals(user._id)) {
                return res.status(400).json({
                  err: `Cannot adopt a dog you registered, please adopt a different dog`,
                });
              }
              if (dogInfo.adopted === true) {
                return res.status(400).json({
                  err: `Cannot adopt a dog that has already been adopted`,
                });
              }
            }
          }
        });
      } else {
        // token does not exist
        return res
          .status(400)
          .json({ err: `Not a valid user in the database` });
      }
    } catch (err) {
      return res.status(400).json({ err: err.message });
    }
  } else {
    // a valid document id has not been entered
    return res.status(500).json({ err: "Please enter a valid document id" });
  }
};

//getting adopted dogs based on a user
const adopt_dogs_get = async (req, res) => {
  const user_id = req.params.id;
  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(user_id)) {
    //pagination
    const pages = req.query.p || 0;
    const AdoptedDogsPerPage = 2;
    try {
      const user = await User.findById(user_id);
      //if user exists, proceed
      if (user) {
        if (pages) {
          const AdoptedDogs = await RegisteredDog.find({
            adoptedBy: user_id,
            adopted: true,
          })
            .skip(pages * AdoptedDogsPerPage)
            .limit(AdoptedDogsPerPage);
          return res.status(200).json({ AdoptedDogs });
        } else {
          //if user does not enter pagination send back all data
          const AdoptedDogs = await RegisteredDog.find({
            adoptedBy: user_id,
            adopted: true,
          });
          return res.status(200).json({ AdoptedDogs });
        }
      } else {
        //user does not exist
        console.log(err);
      }
    } catch (err) {
      return res.status(400).json({ err: err.message });
    }
  } else {
    // a valid document id has not been entered
    return res.status(500).json({ err: "Please enter a valid document id" });
  }
};
// export dog routes for further use
module.exports = {
  register_dogs_get,
  register_dogs_post,
  adopt_dogs_put,
  register_dogs_delete,
  adopt_dogs_get,
};
