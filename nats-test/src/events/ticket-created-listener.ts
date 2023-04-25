import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Why are we type annotating here?
  // In the base Listener class, the type of `subject` is Subjects.TicketCreated. (`T['subject']`). Over here, without the type annotation, `subject = Subjects.TicketCreated;` assumes that the typedef of `subject` is `typeof SubjectsTicketCreated`, which is `Subjects`. This, according to TS means that the property can be changed to a different Subject type in the future . So, we need to specify that typedef of subject is in fact `Subjects.TicketCreated` in order to tell TS that it can't be modified.
  // In place of type annotating, we can use readonly to tell TS that this property cannot be changed to a different type in the future.
  readonly subject = Subjects.TicketCreated;

  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}
