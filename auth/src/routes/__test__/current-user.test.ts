import request from "supertest";
import { app } from "../../app";

it("fetches current user", async () => {
  // Since cookies are managed by the browser/Postman and automatically set on the request as a header, we need some way to replicate that behavior within our tests. So, we manually extract the cookie from the signup response and set it on the request header before hitting "api/users/currentuser".
  const cookie = await global.signup();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);
  expect(response.body.currentUser).toBeNull();
});
