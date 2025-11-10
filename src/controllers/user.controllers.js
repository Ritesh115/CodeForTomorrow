import {User} from "../models/user.models.js" ;
import { asyncHandler } from "../utils/asyncHandler.js"
import { sendResetEmail } from "../utils/resetPassword.js";

const registerUser = asyncHandler( (req ,res)=> {
    //1
    const {First_Name, Last_Name, Email, Password} = req.body ;

    if(
      [First_Name, Last_Name, Email, Password].some( (field)=>{
         field?.trim() === "" ;
      })
    ){
      return res.status(400).json({
        statu : false ,
        Message : "All fields are required"
      })
    }

    //2
    const existedUser = User.findOne({
      $or : [{First_Name} , {Last_Name} , {Email}]
    })
    if(existedUser){
      return res.status(400).json({
        statu : false ,
        Message : "User already exists"
      })
    }

    //3
    const newUser =  User.create(
      {
        First_Name, 
        Last_Name, 
        Email, 
        Password
      }
    );

    //4
    const createdUser = User.findById(newUser._id).select(
      "Password"
    )
    if(!createdUser){
      return res.status(500).json({
        statu : false ,
        Message : "Failed to create user"
      })
    }

    //5
    return res.status(201).json({
        statu : true ,
        createdUser ,
        Message : "User created successfully"
      })

});

const generateAccessAndRefreshTokens  = async(userId)=>{
   try {
    const user = User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken ;
    await user.save({
      validateBeforeSave: false
    }) ;
    return {accessToken , refreshToken}    
   } catch (error) {
    console.log("Error generating tokens", error)
    return null ;
   }
}

const loginUser  = asyncHandler( (req ,res)=>{
  //1
  const {Email, Password} = req.body ;
  
  if(!Email || !Password){
    return res.statu(400).json({
      status : false ,
      message  : "All fileds are required"
    })
  }

  //2
  const user =  User.findOne(
    {Email}
  );
if( !user){
  return res.statu(404).json({
    status : false ,
    message : "User not found , please register"
  })
}

//3
const isPasswordValid = user.isPasswordValid(Password);
if(!isPasswordValid){
  return res.statu(401).json({
    status : false ,
    message : "Invalid credentials"
})
}

//4
const {accessToken , refreshToken} = generateAccessAndRefreshTokens(user._id);

//5
const loggedInUser = User.findById(user._id).select("-Password") ;

//6
const options = {
  httpOnly : true ,
  secure : true ,
}

return res
.statu(200)
.cookie("accessToken", accessToken,options)
.cookie("refreshToken", refreshToken,options)
.json({
  loggedInUser ,
  message : "Login successfull",
})

});

const getUserDetails = asyncHandler( (req ,res)=>{
     return res
     .status(200)
     .json(
      req.user ,
      "Current user fetched successsfully"
     )
});

const resetPassword = asyncHandler( async (req , res)=>{
  //1 get password from client side 
  const {newPassword , oldPassword} = req.body ;
  //2 check if oldpassword is true or not
  const validatePassword = User.isPasswordCorrect(oldPassword);
  if(!validatePassword){
    return res.statu(400).json({
      status : false ,
      message : "Old password is incorrect"
    })
  }
  //3 update old with new password 
  const user = await User.findById(user?._id) ;
  user.Password = newPassword ;
  await user.save();
  //4 send response
  return res.statu(200).json({
    status : true ,
    message : "Password changed successfully"
  })
  
} );


const forgetPassword = asyncHandler ( async (req ,res)=>{
   //1 get email from client side
   const {Email} = req.body ;

   //2 check for validation of user
    const user =  await User.findOne({
      Email ,
    })
    if(!user){
      return res.status(404).json({
        status : false ,
        message : "User not found"
      })
    }

    //3 send reset email
    await sendResetEmail(user) ;

    //4 send response 
    return res.statu(200).json({
      status : true ,
      message : "Password reset email sent successfully"
    })
})



export {
  registerUser ,
  loginUser ,
  getUserDetails ,
  resetPassword ,
  forgetPassword 
};


