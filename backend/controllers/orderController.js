const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");

// create new order
exports.newOrder = catchAsyncError(async (req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,
    itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body;

    // paymentInfo = {...paymentInfo,"paidAt":Date.now()};
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        "paidAt":Date.now(),
        user: req.user._id
    });

    res.status(201).json({
        status: "success",
        order
    });
});


//get Single order
exports.getSingleOrder = catchAsyncError(async (req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }
    res.status(200).json({
        status:"success",
        order
    });
});

//get loggedin user order
exports.myOrders = catchAsyncError(async (req,res,next)=>{
    const orders = await Order.find({user: req.user._id});
    // if(!order){
    //     return next(new ErrorHandler("Order not found",404));
    // }
    res.status(200).json({
        status:"success",
        orders
    });
});

//get All  orders
exports.getAllOrders = catchAsyncError(async (req,res,next)=>{
    const orders = await Order.find();
    
    let totalAmount = 0;

    orders.forEach(order=>{
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        status:"success",
        orders,
        totalAmount
    });
});

//update order status
exports.updateOrder = catchAsyncError(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("This order is already been delivered",404))
    }

    order.orderItems.forEach(async (o)=>{
        await updateStock(o.product,o.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered")
        order.deliveredAt = Date.now();


    await order.save({validateBeforeSave: false});
    res.status(200).json({
        status:"success",
        order
    });
});

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.Stock -= quantity;

    await product.save({validateBeforeSave:false});
}

//delete order
exports.deleteOrder = catchAsyncError(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

    await Order.findByIdAndRemove(req.params.id);

    res.status(200).json({
        status:"success"
    });
});