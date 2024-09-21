class ErrorHandler extends Error{
    statusCode:number;

    constructor(message:any ,statuCode:number){
        super(message);
        this.statusCode = statuCode;

        Error.captureStackTrace(this,this.constructor);

    }
}
export default ErrorHandler;