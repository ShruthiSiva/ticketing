import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if provided ID does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = "Valid Title";
  const price = 20;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(404);
});

it("returns a 401 if user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = "Valid Title";
  const price = 20;

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title,
      price,
    })
    .expect(401);
});

it("returns a 401 if user does not own the ticket", async () => {
  const title = "Valid Title";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(401);
});

it("returns a 400 if invalid title or price are provided", async () => {
  const title = "Valid Title";
  const price = 20;
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: -20,
    })
    .expect(400);
});

it("returns a 200 if ticket is successfully updated", async () => {
  const title = "Valid Title";
  const price = 20;

  const newTitle = "New title";
  const newPrice = 30;

  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  const res = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice);
});

it("publishes an event", async () => {
  const title = "Valid Title";
  const price = 20;

  const newTitle = "New title";
  const newPrice = 30;

  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  const res = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
