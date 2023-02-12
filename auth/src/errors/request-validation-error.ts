// Type of error that's reqtuened when there is a validation attempt using express-validator.
import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  // using `public` or `private` is equivalent to declaring `errors: ValidationError[]` at the top of the class and initializing the property erros within the constructor like `this.errors = errors`
  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Extending a class that's built into the language (like Error), so we need to do this per TS standards.
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => ({
      message: error.msg,
      field: error.param,
    }));
  }
}
