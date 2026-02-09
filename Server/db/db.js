//  Here we will add mongoose to connect to MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file


const ConnectDB= async () =>{
        try{
            const conn=await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB connected: ${conn.connection.host}`);
            // You can also log the connection string if needed
        }
        catch(err){
            console.log("Database connection failed");
        }
}

exports.ConnectDB = ConnectDB;