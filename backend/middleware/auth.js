const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncError(async (req,res,next)=>{
    const { token } = req.cookies;

    if(token == "j:null"){
        return next(new ErrorHandler("Please Login to access this resource",401));
    }

    // console.log(typeof token);
    
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
    
});


exports.authorisedRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role))
        {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403));
        }

        next();
    }
}