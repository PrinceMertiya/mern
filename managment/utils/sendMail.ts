import nodemailer,{Transporter} from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface EmailOptions{
    email:string;
    subject: string;
    template:string;
    data: {[key:string]:any};
}

const sendMail = async(options: EmailOptions):Promise <void> =>{
    const Transporter : Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
	    port: process.env.SMTP_PORT,
	    service: process.env.SMTP_SERVICE,
	    auth:{
		   user:process.env.SMTP_MAIL,
		   pass: process.env.SMTP_PASSWORD,
		},

    });
    const {email,subject,template,date} = options;
    const html = await ejs.renderFile(path.join(__dirname,template),date);
}

