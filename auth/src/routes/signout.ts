import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  // Setting req.session to null destroys all cookies being stored in the browser.
  req.session = null;

  res.send({});
});

export { router as signoutRouter };
