import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

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

  new TicketCreatedListener(stan).listen();
});
// If we restart a listener, ts-node-dev issues a SIGINT/SIGNTERM signal. We want to manually close the client down if this is the case. What happens without this manual shut down?
// Since the client has a randomly generated client ID, once the client restarted, it is a new subscription (due to the different client ID). The previous client is not immediately closed since node-nats-streaming assumes that it may have been a temporary glitch in the service and that the client can be expected to get back up. It waits for a specific duration (see infra/k8s/nats-depl for args) while issuing heatbeats. If it received no response through that duration, it only then assumed that the client has been closed. In the meanwhile, it still tries to send events to that closed listener (through the duration that it was assumed to be up). Only after the listener is fully closed does it reissue that event to one of the new listeners. This messes up the event order.
// So we want to immediately close the client if either of these signals are received instead of leaving it to the nats server.
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
