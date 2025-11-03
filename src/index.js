import express from 'express' ;
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config(
  {
    path : './.env'
  }
)

const app = express() ;

const PORT = process.env.port || 5000 ;

//middleware
app.use(
  cors({
    "origin" :"*",
  })
)
app.use(express.json({
  limit : '20kb' ,
}))

app.use(express.urlencoded({
  extended :true ,
  limit : '20kb'
}))

app.use(cookieParser());

//DB connection
import { connectDB } from "./Db/connectDb.js";
connectDB();


//routes
import  userRouter from "./routes/user.routes.js" ;
app.use("/api/v1/users" , userRouter) ;


app.listen(PORT , ()=>{
  console.log(`server running on port ${PORT}`)
});