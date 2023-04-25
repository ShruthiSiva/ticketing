import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

// Whenever we have to try and extend this base class, we need to provide a custom Event type to it.
export abstract class Listener<T extends Event> {
  // abstract keyword just means that all subclasses extending this parent class must have that property.
  // subject --> channel name
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void;

  // Stan is the typedef of the NATS client.
  // private properties cannot be modified outside of the class. By default, properties can be accessed/modified outside a class.
  private client: Stan;

  // protected allows the subclass to define it if it wants to.
  // we are defaulting ackWait to be 5000ms (5sec)
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    // Instead of passing options as an object (as would have been intuitive), we have to chain on methods that each create the options object due to the node-nats-streaming implementation.
    return (
      this.client
        .subscriptionOptions()
        // This sends a list of all events ever published to the listener whenever the listener with a particular durable name is stood up.
        // So, the very first time a service is stood up and a subscription comes online, it will receive a record of every event ever sent. If the service with the same durable name is restarted, this options is ignored and it doesn't re-deliver all events. It only sends failed events due to the .setDurableName() option.
        .setDeliverAllAvailable()
        // Default behavior of the NATS server is - once a subscription consumes an event, the event is lost. We would like for the server to keep a record of these events in case the event processing fails on the subscription's side and we would like to replay old events. By setting the Ack mode to manual and true, the node-nats-streaming library will no longer auto acknowledge to the server that the event has been received (thereby marking it for deletion within the server). Instead, we will manually acknowledge the event from our side by calling msg.ack() once the processing of that event is successfully completed on the backend.
        // If after a set timeout (30 secs), the server doesn't receive an acknowledgement, it will re-send the event to a subscription within the queue group.
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        // SetDurableName only sends over the failed events per Durable Subscription (we can create durable subscriptions for each service by providing the service name as a param to setDurableName())
        // re-use queueGroupName
        .setDurableName(this.queueGroupName)
    );
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : // If type of data is Buffer
        JSON.parse(data.toString("utf8"));
  }
}
