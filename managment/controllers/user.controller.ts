require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../model/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchASyncError } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

// Register user interface
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// Register user
export const registrationUser = CatchASyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const isEmailExist = await userModel.findOne({ email });

    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const user: IRegistrationBody = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };

    // Render the EJS template for activation email
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-mail.ejs"),
      data
    );
    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });


      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`, // Success message with email
        activationToken: activationToken.token, // Return the activation token for reference
      });

    } catch (error: any) {
      // Handle any error that occurs during the email sending process
      return next(new ErrorHandler(error.message, 400)); // Pass the error message and status code to error handler
    }




    // Additional email sending logic would go here

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Interface for activation token
interface IActivationToken {
  token: string;
  activationCode: string;
}

// Create activation token
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString(); // Corrected typo: 'toSstring' to 'toString'

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );

  return { token, activationCode };
}

//activation user

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchASyncError(async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { activation_token, activation_code } = req.body as IActivationRequest;

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode:string };
    
    if (newUser.activationCode != activation_code){
      return next(new ErrorHandler('Activation code is incorrect', 400));
    }
    
    const{name,email,password} = newUser.user;
    const existUser = await userModel.findOne({email});

    if(existUser){
      return next(new ErrorHandler("email already exist",400));

    }
    const user = await userModel.create({
      name,
      email,
      password,
    });
    res.status(201).json({
      message:"user activated successfully",user
    })

  }
  catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
 }
);

//USer login

interface ILoginRequest {
  email : string;
  password : string;

}

export const loginUser = CatchASyncError(async(req:Request, res:Response,next:NextFunction) => {
  try{
    const {email,password} = req.body as ILoginRequest;

    if(!email || password){
      return next(new ErrorHandler('Please provide email and password', 400));
    };

    const user = await userModel.findOne({email}).select("+password");

    if(!user){
      return next(new ErrorHandler("Invalid email or password" , 400));

    };

    const isPasswordMatch = await user.comparePassword(password);
    if(!isPasswordMatch){
      return next(new ErrorHandler("Invalid email or password", 400));
    };

    
}
catch (error:any){
  return next(new ErrorHandler(error.message, 400));

}

}); 