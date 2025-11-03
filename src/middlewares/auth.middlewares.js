import {User} from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken" ;

const verifyJwt = asyncHandler(
  async(req , res , next) => {
     //1
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
     if(!token){
      return res.status(401).json({
        message : "Unauthorized , token is required" 
      })
     }
     //2
     const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

     const user = await User.findById(decodedToken?._id).select("-Password") ;

     if(!user){
       return res.status(401).json({
        message : "Invalid token",
       })
     }

     //3
     req.user = user ;
     next();
  }
);

export {verifyJwt}