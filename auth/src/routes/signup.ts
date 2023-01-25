import express, { Request, Response } from "express";
// Validates body, query strings, params on the request etc.
import { body, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  (req: Request, res: Response) => {
    // When the two validation steps above execute and if there's an error that's caught, they append some properties on the request object. The validationResult function is used to parse these values.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // return errors as an array of errors
      return res.status(400).send(errors.array());
    }

    console.log("Creating a user");

    const { email, password } = req.body;

    res.send({});
  }
);

export { router as signupRouter };
