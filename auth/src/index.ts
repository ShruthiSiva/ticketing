import express from "express";
// Why do we need 'express-async-errors'? See explanation for the app.all() handler.
import "express-async-errors";
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

// requests are being proxied through ingress-nginx before being sent to our auth server. Express doesn't trust a HTTPS connection if it's being sent via a proxy. This line informs express that it's behind a proxy (ingress-nginx) and that it should trust HTTPS traffic as being secure even if it's coming from that proxy.
app.set("trust proxy", true);

app.use(json());
// https://www.npmjs.com/package/cookie-session
app.use(
  cookieSession({
    // cookies need not be encrypted since JWT is tamper resistant.
    signed: false,
    // cookies should only be sent over a HTTPS connection. Do not manage cookies (send cookies) if the user is connecting over an HTTP connection.
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// app.all encompasses get, put, post, delete etc.
app.all("*", () => {
  throw new NotFoundError();
});

/**--------------------------------------------------------------*/
// If we were to add in the async keyword on the controller, the request would just hang once it's called and throw no error. This is because of the way express is designed where - without the async keyword, throwing an error is handled by express and passed down to the next middleware. With the async keyword, the only way to pass that error down is to pass it into next like next(new NotFoundError()). Instead of needing to use next, we can use the "express-async-errors" package that handles screnarios where there's an error being thrown within an async controller.
// Reference doc: https://expressjs.com/en/guide/error-handling.html
// app.all("*", async () => {
//   throw new NotFoundError();
// });
/**--------------------------------------------------------------*/

// If there are any errors being thrown from the previous routes, they trickle down and hit the error handling middleware.
app.use(errorHandler);

const start = async () => {
  try {
    // Always check that we have the required env variables during startup.
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_Key must be defined");
    }

    // Adding a /auth to the end tells mongoose to create that auth DB on its own if it doesn't exist.
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000...");
  });
};

start();
