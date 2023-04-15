import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS.");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  // Instead of passing options as an object (as would have been intuitive), we have to chain on methods that each create the options object due to the node-nats-streaming implementation.
  const options = stan
    .subscriptionOptions()
    // Default behavior of the NATS server is - once a subscription consumes an event, the event is lost. We would like for the server to keep a record of these events in case the event processing fails on the subscription's side and we would like to replay old events. By setting the Ack mode to manual and true, the node-nats-streaming library will no longer auto acknowledge to the server that the event has been received (thereby marking it for deletion within the server). Instead, we will manually acknowledge the event from our side by calling msg.ack() once the processing of that event is successfully completed on the backend.
    // If after a set timeout (30 secs), the server doesn't receive an acknowledgement, it will re-send the event to a subscription within the queue group.
    .setManualAckMode(true)
    // This sends a list of all events ever published to the listener whenever the listener is restarted
    // So, the very first time a service is stood up and a subscription comes online, it will receive a record of every event ever sent.
    .setDeliverAllAvailable()
    // SetDurableName only sends over the failed events per Durable Subscription (we can create durable subscriptions for each service by providing the service name as a param to setDurableName())
    .setDurableName("orders-service");

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(
        `Received event # ${msg.getSequence()}, with data`,
        JSON.parse(data)
      );
    }

    msg.ack();
  });
});

// If we restart a listener, ts-node-dev issues a SIGINT/SIGNTERM signal. We want to manually close the client down if this is the case. What happens without this manual shut down?
// Since the client has a randomly generated client ID, once the client restarted, it is a new subscription (due to the different client ID). The previous client is not immediately closed since node-nats-streaming assumes that it may have been a temporary glitch in the service and that the client can be expected to get back up. It waits for a specific duration (see infra/k8s/nats-depl for args) while issuing heatbeats. If it received no response through that duration, it only then assumed that the client has been closed. In the meanwhile, it still tries to send events to that closed listener (through the duration that it was assumed to be up). Only after the listener is fully closed does it reissue that event to one of the new listeners. This messes up the event order.
// So we want to immediately close the client if either of these signals are received instead of leaving it to the nats server.
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
