import {Router} from 'express' ;

import {
  registerUser ,
  loginUser ,
  getUserDetails ,
  resetPassword ,
  forgetPassword 
} from "../controllers/user.controllers.js" ;

import { verifyJwt } from "../middlewares/auth.middlewares.js" ;

const userRouter = Router() ;

//register user
userRouter.route("/register").post(registerUser) ;

//login user
userRouter.route("/login").post(loginUser) ;

//get current user details
userRouter.route("/me").get(verifyJwt , getUserDetails) ;

// reset password
userRouter.route("/reset-password").post(verifyJwt ,resetPassword) ;

// forget password
userRouter.route("/forget-password").post(forgetPassword) ;


export default Router;