import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const order = Order;
};
