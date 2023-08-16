const express = require("express");
const { 
    getAllProducts ,createProduct, 
    updateProduct, deleteProduct, 
    getProductDetails, createProductReview, 
    getProductReviews, deleteReview
} = require("../controllers/productController");

const { isAuthenticatedUser, authorisedRoles } = require("../middleware/auth");

const router = express.Router();

// All users
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview);



//Admins 
router.route("/admin/product/new").post(isAuthenticatedUser,authorisedRoles("admin"),createProduct);

router.route("/admin/product/:id").put(isAuthenticatedUser,authorisedRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorisedRoles("admin"),deleteProduct);




module.exports = router;