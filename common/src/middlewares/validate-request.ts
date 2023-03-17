import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import { RequestValidationError } from "../errors/request-validation-error";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // When the validation steps execute (the array before the validationResult middleware is called in route handlers such as signin and signup), and if there's an error that's caught, they append some properties on the request object. The validationResult function is used to parse these values.
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  // Move on to the next middleware in the chain or the route handler inside which the middleware is called.
  next();
};
