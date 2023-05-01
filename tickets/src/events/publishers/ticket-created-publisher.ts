import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@shruthisivatickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
