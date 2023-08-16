const express = require("express");
const { 
    registerUser, loginUser, 
    logout, forgotPassword, 
    ressetPassword, getUserDetail, 
    updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require("../controllers/userController");
const {isAuthenticatedUser, authorisedRoles} = require("../middleware/auth")
const router = express.Router();



router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/logout").get(logout);

router.route("/password/reset/:token").put(ressetPassword);

router.route("/me").get(isAuthenticatedUser,getUserDetail);

router.route("/me/update").put(isAuthenticatedUser,updateProfile);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/admin/users").get(isAuthenticatedUser,authorisedRoles("admin"),getAllUsers);

router.route("/admin/user/:id").get(isAuthenticatedUser,authorisedRoles("admin"),getSingleUser).put(isAuthenticatedUser,authorisedRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser,authorisedRoles("admin"),deleteUser);

module.exports = router; 