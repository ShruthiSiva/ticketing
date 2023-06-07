import express, { Request, Response } from "express";
import { Order } from "../models/order";
import { OrderStatus } from "../models/order";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@shruthisivatickets/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// Cancels an order. This sets the order status as "cancelled" but doesn't delete the resource from the DB. So, a "put" or "patch" would be more appropriate compared to a "delete" request.
router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    order.status = OrderStatus.Cancelled;

    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    // 204 is when a resource is successfully deleted. Here, we're updating the resource, so technically this would be a 200, but we're chosing to keep the 204.
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
