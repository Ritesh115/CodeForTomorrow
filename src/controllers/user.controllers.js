import {User} from "../models/user.models.js" ;
import { asyncHandler } from "../utils/asyncHandler.js"
import { sendResetEmail } from "../utils/resetPassword.js";

const registerUser = asyncHandler( async (req ,res)=> {
    //1
    const {First_Name, Last_Name, Email, Password} = req.body ;

    if(
      [First_Name, Last_Name, Email, Password].some( (field)=>{
         return field?.trim() === "" ;
      })
    ){
      return res.status(400).json({
        status : false ,
        message : "All fields are required"
      })
    }

    //2
    const existedUser = await User.findOne({
      $or : [{First_Name} , {Last_Name} , {Email}]
    })
    if(existedUser){
      return res.status(400).json({
        status : false ,
        message : "User already exists"
      })
    }

    //3
    const newUser =  await User.create(
      {
        First_Name, 
        Last_Name, 
        Email, 
        Password
      }
    );

    //4
    const createdUser = await User.findById(newUser._id).select(
      "-Password -refreshToken"
    )
    if(!createdUser){
      return res.status(500).json({
        status : false ,
        message : "Failed to create user"
      })
    }

    //5
    return res.status(201).json({
        status : true ,
        createdUser ,
        message : "User created successfully"
      })

});

const generateAccessAndRefreshTokens  = async(userId)=>{
   try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();
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

const loginUser  = asyncHandler( async (req ,res)=>{
  //1
  const {Email, Password} = req.body ;
  
  if(!Email || !Password){
    return res.status(400).json({
      status : false ,
      message  : "All fields are required"
    })
  }

  //2
  const user = await User.findOne(
    {Email}
  );
if( !user){
  return res.status(404).json({
    status : false ,
    message : "User not found , please register"
  })
}

//3
const isPasswordValid = await user.isPasswordCorrect(Password);
if(!isPasswordValid){
  return res.status(401).json({
    status : false ,
    message : "Invalid credentials"
})
}

//4
const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user?._id);

//5
const loggedInUser = await User.findById(user._id).select("-Password") ;

//6
const options = {
  httpOnly : true ,
  secure : true ,
}

return res
.status(200)
.cookie("accessToken", accessToken,options)
.cookie("refreshToken", refreshToken,options)
.json({
  loggedInUser ,
  message : "Login successful",
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

const changePassword = asyncHandler( async (req , res)=>{
  //1 get password from client side 
  const {newPassword , oldPassword} = req.body ;

  //2 update old with new password 
  const user = await User.findById(req.user?._id) ;
  if(!user){
    return res.status(404).json({
      status : false ,
      message : "User not found"
    })
  }

  //3 check if oldpassword is true or not
  const validatePassword = await user.isPasswordCorrect(oldPassword);
  if(!validatePassword){
    return res.status(400).json({
      status : false ,
      message : "Old password is incorrect"
    })
  }
  
  //4 update to new password
  user.Password = newPassword ;
  await user.save({
    validateBeforeSave : false ,
  });

  //5 send response
  return res.status(200).json({
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
    return res.status(200).json({
      status : true ,
      message : "Password reset email sent successfully"
    })
})

const resetPassword = asyncHandler ( async (req, res)=>{
  //1 get token and new password from client side
  const {newPassword , token} = req.body ;
  if(!token || !newPassword){
    return res.status(400).json({
      status : false ,
      message : "All fileds are required"
    })
  }
  //2  Verify the user using token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TEMP_TOKEN_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //3 find user based on token
  const user = await User.findOne({
    _id : decoded?._id ,
    tempToken: hashedToken,
    tempTokenExpiry: { $gt: Date.now() },
  })
  if(!user){
    return res.status(400).json({
      status : false ,
      message : "Invalid or expired token"
    })

    //4 update password
    user.Password = newPassword ;
    user.tempToken = undefined;
    user.tempTokenExpiry = undefined;
    await user.save({
      validateBeforeSave : false ,
    });

    // 5 send response
    return res.status(200).json({
      status : true ,
      message : "password reset successfully"
    })
  }


})
export {
  registerUser ,
  loginUser ,
  getUserDetails ,
  changePassword ,
  forgetPassword ,
  resetPassword
};





