require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import userModel from "../model/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchASyncError } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";

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
    try{
        await userModel.create(user);
    }
    catch(error){
        
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
