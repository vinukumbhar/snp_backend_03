require('dotenv').config()
const express= require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const userroutes = require('./Routes/userroutes')


const app =express()
app.use(express.json())
app.use( (req , res ,next)=>
{
    console.log(req.path,req.method)
    next()
})

app.use(session({
    secret: process.env.SECRET, // You should set this in your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you're using HTTPS
  }));
app.use('/api/user', userroutes)


mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        app.listen(process.env.PORT,()=> {

            console.log('Listening to the port' ,process.env.PORT);
        })
    })
    .catch((error)=>{ 
        console.log(error)
    })



process.env