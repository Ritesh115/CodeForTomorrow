import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  First_Name : {
    type : String ,
    required : true ,
    lowercase : true ,
    trim  : true ,
  },
  Last_Name : {
    type : String ,
    required : true ,
    lowercase : true ,
    trim  : true ,
  },
  Email : {
    type : String ,
    required : true ,
    lowercase : true ,
    trim  : true ,
  },
  Password : {
    type : String ,
    unique : true ,
    required : [true , 'password is required'],
    
  }
}, {timestamps : true})

//password hashing
import bcrypt from "bcrypt"
userSchema.pre('save' , async function(next){
  if(!this.isModified('Password')){
    return next();
  }
  this.Password = await bcrypt.hash(this.Password,  10);
  next();
})

//check for password correct
userSchema.methods.isPasswordCorrect = async function (Password){
  return await bcrypt.compare(Password , this.Password);
}

//token generation
userSchema.methods.generateAccessTokens = function(){
  return jwt.sign(
    {
      _id : this._id ,
      First_Name : this.First_Name ,
      Last_Name : this.Last_Name ,
      Email : this.Email ,
    } ,
    process.env.ACCESS_TOKEN_SECRET ,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshTokens = function(){
  return jwt.sign(
    {
      _id : this._id ,
    } ,
    process.env.REFRESH_TOKEN_SECRET ,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model( "User" , userSchema);
