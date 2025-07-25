const express= require('express');
// Here we will add dotenv to manage environment variables
const dotenv = require('dotenv');
const cors = require("cors");
dotenv.config(); // Load environment variables from .env file
const app= express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use(cors());
// Here we will import the ConnectDB function to connect to MongoDB
const { ConnectDB } = require('./db/db');   
const router =require("./routes/superAdmin.route");
const userRouter= require('./routes/user.route');
const loanRouter=require('./routes/loan.route');
const storeRouter =require('./routes/store.route');
const adminRouter = require('./routes/admin.route');
const QuranHadeesRouter = require("./routes/QuranHadees.route");
app.get("/",(req,res)=>{
    res.send("Hello from the server again");
});
app.use('/register',router);
app.use('/register',userRouter);
app.use('/register',loanRouter);
app.use('/register',storeRouter);
app.use('/register',adminRouter);
app.use('/register',QuranHadeesRouter);

// Connect to MongoDB
ConnectDB();



const PORT= parseInt(process.env.PORT) || 3000;
// console.log( typeof process.env.PORT);
app.listen(PORT,()=>{
    console.log(`Server is running on this ${PORT}`)
})