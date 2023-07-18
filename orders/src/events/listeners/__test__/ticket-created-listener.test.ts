import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@shruthisivatickets/common";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 25,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    // We're assigning a jest mock to this so it can keep track of how many times it's been called, etc.
    ack: jest.fn(),
  };

  return { listener, data, msg };
};
it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // call onMessage funtion with data object + msg object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call onMessage funtion with data object + msg object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});
