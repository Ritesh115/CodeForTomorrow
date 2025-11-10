import {Router} from 'express' ;

import {
  registerUser ,
  loginUser ,
  getUserDetails ,
  changePassword,
  forgetPassword ,
  resetPassword
} from "../controllers/user.controllers.js" ;

import { verifyJwt } from "../middlewares/auth.middlewares.js" ;

const userRouter = Router() ;

//register user
userRouter.route("/register").post(registerUser) ;

//login user
userRouter.route("/login").post(loginUser) ;

//get current user details
userRouter.route("/get").get(verifyJwt , getUserDetails) ;

// reset password
userRouter.route("/reset-password").post(verifyJwt , changePassword) ;

// forget password
userRouter.route("/forget-password").post(verifyJwt , forgetPassword) ;

// resetPassword
userRouter.route("/reset-password").post(resetPassword) ;

export default userRouter;