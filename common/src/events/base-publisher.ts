import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  protected client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      // The NATS server only accepts strings, so we need to JSON.stringify(data)
      // The first argument is the subject (name of the channel), second is the data to be passed, third is the callback to be invoked after the publish event is complete.
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) reject(err);
        console.log(`Event published to subject ${this.subject}`);
        resolve();
      });
    });
  }
}
