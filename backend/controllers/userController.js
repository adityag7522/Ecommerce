const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");


//register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl"
        }
    });

    sendToken(user,201,res);
});


//LOGIN USER
exports.loginUser = catchAsyncErrors(async (req,res,next)=>{
    const {email,password} = req.body;

    //checking if user has given password and email both
    if(!email || !password) return next(new ErrorHandler("Please Enter email and password",401));

    const user = await User.findOne({ email }).select("+password");
    if(!user) return next(new ErrorHandler("Invalid email or Password"));

    const isPasswordMatched = await user.comparePassword(password);


    if(!isPasswordMatched) return next(new ErrorHandler("Invalid email or Password",401));

    sendToken(user,200,res);

});
 
// logout
exports.logout = catchAsyncErrors(async(req,res,next) =>{
    res.cookie("token",null,{
        expire:new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        sucess: true,
        message:"Logged out"
    });
});


//forgot password
exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user) return next(new ErrorHandler("User Not Found",404));

    // get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you haven't requested this email
    then, please ignore it.`;

    try{
        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Reset",
            message
        });

        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`
        });
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save({validateBeforeSave: false});
        
        return next(new ErrorHandler(error.message,500));
    }

});

//reset password
exports.ressetPassword = catchAsyncErrors(async (req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}
    });

    if(!user) return next(new ErrorHandler("Token is invalid or expired",404));

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password doesn't match",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);


});


//get user detail
exports.getUserDetail = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });

});

//update user password
exports.updatePassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is incorrect",400));
    }
    // console.log(req.body.newPassword + " " + req.body.confirmPassword);
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);

});

//update User profile
exports.updateProfile = catchAsyncErrors(async (req,res,next)=>{

    const newData = {
        name:req.body.name,
        email:req.body.email
    }

    await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        data:newData
    });

});


//Get all users (Admin)
exports.getAllUsers = catchAsyncErrors(async (req,res,next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});


//Get User (Admin)
exports.getSingleUser = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user)
        return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`));

    res.status(200).json({
        success: true,
        user
    });
});


//update User profile --Admin
exports.updateUserRole = catchAsyncErrors(async (req,res,next)=>{

    const newData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }


    await User.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
    });

});

//Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{


    //we will remove cloudinary

    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`));

    await User.findByIdAndRemove(req.params.id);

    res.status(200).json({
        success:true
    });

});