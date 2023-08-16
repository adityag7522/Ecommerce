const mongoose = require("mongoose");



const connectDB = () => {
    mongoose.connect(process.env.DB_URI,{
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        family: 4
    }).then((data)=>{
        console.log(`mongodb connected with server: ${mongoose.connection.host}`);
    });
}

module.exports = connectDB;