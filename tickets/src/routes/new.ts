import express, { Request, Response } from "express";
import {
  currentUser,
  requireAuth,
  validateRequest,
} from "@shruthisivatickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";

const router = express.Router();

// Validation goes after requireAuth since we don't want to move forward if user is not authenticated.
router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
