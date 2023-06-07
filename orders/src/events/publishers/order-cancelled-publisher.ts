import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@shruthisivatickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
