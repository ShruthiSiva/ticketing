import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  interface: string;
}

// Reaching into an existing type definition and augmenting whatever prperties we want onto a specific interface
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If the user's browser has the jwt in a cookie, it is automatically sent to the server on every request. This request flows through the cookie-session middleware that decodes the base64 encoded cookie and sets it on the req.session object.
  // We inspect this req.session object to see if there is a jwt cookie attached and if that jwt is then valid.
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}
  next();
};
