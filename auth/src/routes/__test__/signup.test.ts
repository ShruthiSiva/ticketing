import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  // The environment variable was created within a separate pod (as a Secret object). Tests do not talk to the running instance of the application (so if there's networking between pods, that would need to be mocked somehow, like we did with MondoDB). We set this variable in setup.ts for the time being. It's not the best strategy, but gets the error to go away.
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  // pass in the app so supertest has access to all of the routers.
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  // pass in the app so supertest has access to all of the routers.
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "pas",
    })
    .expect(400);
});

it("returns a 400 with missing email/password", async () => {
  // if we want to test 2 things in the same "it" block, we should await the first one. Behind the scenes, Jest automatically awaits the last request, so we can simply use "return"
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);
  return request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  // "get" is a method built into "response" that allows us to look up headers set on the response.
  expect(response.get("Set-Cookie")).toBeDefined();
});
