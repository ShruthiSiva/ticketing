import nats from "node-nats-streaming";

console.clear();

// nats documentation refers to the client that is returned after nats.connect() as "stan"
// nats doesn't support async/await syntax. We typically use callbacks or an event driven approach.
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // The NATS server only accepts strings
  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  // The first argument is the subject (name of the channel), second is the data to be passed, third is the callback to be invoked after the publish event is complete.
  stan.publish("ticket:created", data, () => console.log("Event Published"));
});
