import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

// We want to have a different definition of a Ticket (to contain only a subset of properties of an original ticket) that is relevant to the orders service. So, we don't want to re-use the model defition in the tickets service.
interface TicketAttrs {
  title: string;
  price: number;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// statics allows us to add a method to the Ticket model. It gets us access to the overall collection
ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);

// methods allows us to add a function to every single document. So this method is document speicific since we want to know if an individual ticket has been reserved.
// the `function` keywork needs to be used here. This can't be an arrow function. For regular functions, this equals the object that owns the function (in this case, the individual Ticket document that we're calling isReserved on). For arrow functions, it looks at the outer context (values in the file) as its this value.
ticketSchema.methods.isReserved = async function () {
  // Make sure that this ticket is not already reserved - run query to look at all orders. Find an order where the ticket is the ticket we just found *and* the order status is *not* "cancelled". If we find an order like this, that means the ticket is reserved.
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, TicketDoc };
