const app = require("./app");

const dotenv = require("dotenv");
const connectDB = require("./config/database");

//Handling uncaught exception
process.on("uncaughtException",(err)=>{
    console.log(`error: ${err.message}`);
    console.log("Shutting down the server");
    process.exit(1);
});

//config
dotenv.config({path:"backend/config/config.env"});


//connecting database
connectDB();



const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

//unHandeled Promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the Server`);
    server.close(()=>{
        process.exit(1);
    });
});

