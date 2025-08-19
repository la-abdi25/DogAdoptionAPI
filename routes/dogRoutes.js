//import dog controllers
const dogControllers = require("../controllers/dogControllers");
const express = require("express");
const router = express.Router();

//import user authentication middleware
const { authUser } = require("../middlewares/authUsers");

//route to list registered dogs based on a specific user:
// Authenticated users can list dogs they've registered,
// with support for filtering by status and pagination.
router.get("/registerdogs/:id", authUser, dogControllers.register_dogs_get);

//route to list adopted dogs based on a specific user:
//Authenticated users can list dogs they've adopted, with pagination support.
router.get("/adoptdogs/:id", authUser, dogControllers.adopt_dogs_get);

//route to adopt a dog by its id
//Authenticated users can adopt a dog by its ID, including a thank-you message for the original owner.
// Restrictions apply:
// a dog already adopted cannot be adopted again, and users cannot adopt dogs they registered.
router.put("/adoptdogs/:id", authUser, dogControllers.adopt_dogs_put);

//route to register a dog
//Authenticated users can register dogs awaiting adoption, providing a name and a brief description.
router.post("/registerdogs", authUser, dogControllers.register_dogs_post);

//route to delete a dog
//Owners can remove their registered dogs from the platform unless the dog has been adopted.
//Users cannot remove dogs registered by others.
router.delete(
  "/registerdogs/:id",
  authUser,
  dogControllers.register_dogs_delete
);

//export dog routes for further use
module.exports = router;
