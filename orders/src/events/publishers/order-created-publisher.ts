import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@shruthisivatickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
