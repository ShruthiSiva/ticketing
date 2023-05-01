import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@shruthisivatickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
