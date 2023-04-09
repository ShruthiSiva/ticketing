import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";

// Whenever a middleware function has 4 arguments, it is automatically considered an error handling middleware by express. Express distinguishes between the types of middlewares (error handling or regular) by the number of arguments it accepts. Error handling middlewares are used to capture errors and process them.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    const statusCode = err.statusCode;
    const errors = err.serializeErrors();
    return res.status(statusCode).send({ errors });
  }

  console.error(err);

  res.status(400).send({
    errors: [
      {
        message: err.message || "Something went wrong",
      },
    ],
  });
};
