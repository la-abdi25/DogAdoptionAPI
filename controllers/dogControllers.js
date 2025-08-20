//handle register request via Register Dog Model
const { RegisteredDog } = require("../models/DogRegModel");
const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");
const Messages = require("../models/MessageModel");
//import mongoose for validation checks
const mongoose = require("mongoose");

//getting all registered dogs
const register_alldogs_get = async (req, res) => {
  try {
    //pagination
    const pages = req.query.p || 0;
    const status = req.query.adopted;
    const registeredDogsPerPage = 2;
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if token exists
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Please log in to view all registered dogs" });
        } else {
          const user = await User.findById(decodedToken.id);
          //if the user exists, proceed
          //get all registered dogs in the database
          if (user) {
            if (pages && status) {
              const AllRegisteredDogs = await RegisteredDog.find(
                {
                  adopted: status,
                },
                { _id: 1, name: 1, description: 1, adopted: 1 }
              )
                .skip(pages * registeredDogsPerPage)
                .limit(registeredDogsPerPage);
              return res.status(200).json({ AllRegisteredDogs });
            } else {
              const AllRegisteredDogs = await RegisteredDog.find({});
              return res.status(200).json({ AllRegisteredDogs });
            }
          } else {
            return res
              .status(400)
              .json({ err: `Not a valid user in the database` });
          }
        }
      });
    } else {
      return res.status(400).json({ err: `Please log in` });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};
//getting registered dogs based on logged in user
const register_mydogs_get = async (req, res) => {
  try {
    //pagination
    const pages = req.query.p || 0;
    const status = req.query.adopted;
    const registeredDogsPerPage = 2;
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if token exists
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res.status(400).json({
            err: "Please log in to view your registered dogs",
          });
        } else {
          const user = await User.findById(decodedToken.id);
          //if user exists proceed
          if (user) {
            if (pages && status) {
              const registeredDogs = await RegisteredDog.find({
                registeredBy: user._id,
                adopted: status,
              })
                .skip(pages * registeredDogsPerPage)
                .limit(registeredDogsPerPage);
              return res.status(200).json({ registeredDogs });
            } else {
              const registeredDogs = await RegisteredDog.find({
                registeredBy: user._id,
              });
              return res.status(200).json({ registeredDogs });
            }
          } else {
            return res
              .status(400)
              .json({ err: `Not a valid user in the database` });
          }
        }
      });
    } else {
      return res
        .status(400)
        .json({ err: `Please log in to view your registered dogs` });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
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
    } else {
      return res.status(400).json({ err: `Please log in` });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

// Removing Dogs: Owners can remove their registered dogs from the platform
// unless the dog has been adopted. Users cannot remove dogs registered by others.
const register_dogs_delete = async (req, res) => {
  const dog = req.body.id;
  if (!dog) {
    return res.status(500).json({
      err: "Please enter the dog id for the dog you would like to delete",
    });
  }
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
        return res.status(400).json({ err: `Please log in` });
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
  const errors = {};
  const { id, message } = req.body || {};

  if (!id) {
    errors.id = "Please enter a dog id";
  }

  if (!message) {
    errors.message = "Please enter a message to send to the original dog owner";
  }

  if (!id || !message) {
    return res.status(400).json({ errors });
  }

  //check to see if a valid document id has been entered
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      //get the token from the cookies
      const token = req.cookies.jwt;
      //check to see if user sent a thank you message to the original dog owner in

      //if token exists
      if (token) {
        //verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          if (err) {
            return res
              .status(400)
              .json({ err: "Please log in to adopt a dog" });
          } else {
            const dogInfo = await RegisteredDog.findById(id);
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
                { _id: dogInfo.id }, // Filter to match dog id
                { $set: { adopted: true, adoptedBy: user._id } }
              );
              return res.status(200).json({
                msg: `Successfully adopted ${id} and sent message to ${dogInfo.registeredBy}`,
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
        return res.status(400).json({ err: `Please log in` });
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
const adopt_mydogs_get = async (req, res) => {
  try {
    //pagination
    const pages = req.query.p || 0;
    const AdoptedDogsPerPage = 2;
    //get the token from the cookies
    const token = req.cookies.jwt;
    //if token exists
    if (token) {
      //verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Please log in to view all registered dogs" });
        } else {
          const user = await User.findById(decodedToken.id);
          //if the user exists, proceed
          if (user) {
            const AdoptedDogs = await RegisteredDog.find({
              adoptedBy: user._id,
              adopted: true,
            })
              .skip(pages * AdoptedDogsPerPage)
              .limit(AdoptedDogsPerPage);
            return res.status(200).json({ AdoptedDogs });
          } else {
            //user does not exist
            return res
              .status(400)
              .json({ err: `Not a valid user in the database` });
          }
        }
      });
    } else {
      return res.status(400).json({ err: `Please log in` });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

// export dog routes for further use
module.exports = {
  register_mydogs_get,
  register_dogs_post,
  adopt_dogs_put,
  register_dogs_delete,
  adopt_mydogs_get,
  register_alldogs_get,
};
