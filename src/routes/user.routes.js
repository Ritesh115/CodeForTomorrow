import {Router} from 'express' ;

import {
  registerUser ,
  loginUser ,
  getUserDetails
} from "../controllers/user.controllers.js" ;

import { verifyJwt } from "../middlewares/auth.middlewares.js" ;

const userRouter = Router() ;

//register user
userRouter.route("/register").post(registerUser) ;

//login user
userRouter.route("/login").post(loginUser) ;

//get current user details
userRouter.route("/me").get(verifyJwt , getUserDetails) ;

export default Router;