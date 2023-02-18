import express from "express";
// Why do we need 'express-async-errors'? See explanation for the app.all() handler.
import "express-async-errors";
import { json } from "body-parser";
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
    // We check the node env to determine the value for this property. If we're running the app in dev/stsge/production, set this value to "true". If we're running it in "test" mode, set it to "false" since supertest can only send out HTTP requests. When a request is made via HTTP, cookies won't be set on the response headers. So we toggle this property to "false" for testing cookies using supertest.
    secure: process.env.NODE_ENV !== "test",
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

export { app };
