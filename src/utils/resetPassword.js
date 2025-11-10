import jwt from "jsonwebtoken";
import crypto from "crypto" ;
import nodemailer from "nodemailer" ;


const sendResetEmail = async (user)=>{
     //1 generate reset temporary token for user
     const tempToken = jwt.sign(
        {
             _id : user?._id ,
        } ,
        process.env.TEMP_TOKEN_SECRET ,
        {
          expiresIn : process.env.TEMP_TOKEN_EXPIRY ,
        }
     );

     //2 hashing the token before saving to Db for security
     const hashedToken = crypto.hash('sha256').update(tempToken).digest('hex') ;

     //3 store in Db .
     user.tempToken = hashedToken ;
     user.tempTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min expiry
     await user.save() ;

     //4 create reset link
     const resetLink = `https://localhost:5000/reset-password?token=${tempToken}` ;

     //5 send email to user with nodemailer
      //Create a transporter.
      //Compose a message. Define sender, recipient(s), subject, and content.
     //Send it with transporter.sendMail().

     const transporter = nodemailer.createTransport({
          service: "gmail", 
          auth: {
               user: "process.env.EMAIL_USER",
               pass: "process.env.EMAIL_PASS", // Use App Password if using Gmail + 2FA
          },
     })

     const mailOptions = {
          from : "process.env.EMAIL_USER" ,
          to : "user.Email"  ,
          subject :"Password reset request" ,
          html: `
             <p>Hello,</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>If you didn't request this, you can ignore this email.</p>
           `,
     } ;

     await transporter.sendMail(mailOptions);
     console.log("Password reset email sent to", user.Email);
}

export {sendResetEmail} ;