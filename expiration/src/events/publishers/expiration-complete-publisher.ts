import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@shruthisivatickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
