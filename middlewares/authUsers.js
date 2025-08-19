//import jwt for user login authentication
const jwt = require("jsonwebtoken");

//middleware for handling authenticated user requests, enable middleware for protected routes
const authUser = (req, res, next) => {
  const token = req.cookies.jwt;
  //check if token exists and is verfied
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(400).json({ msg: "Please log in" });
      } else {
        //user logged in
        next();
      }
    });
  } else {
    //token does not exist
    return res.status(400).json({ msg: "Please log in" });
  }
};
//export authUser middleware for further use
module.exports = { authUser };
