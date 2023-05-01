// This starts up a copy of MongoDB in memory. This allows us to run multiple test suites at the same time across different projects without having them all reach out to the same copy of Mongo.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string[];
}

let mongo: any;

// This will look inside the __mocks__ directory to find a file with the same name. This applies the nats-wrapper mock to all test files.
jest.mock("../nats-wrapper");

beforeAll(async () => {
  // The environment variable was created within a separate pod (as a Secret object). Tests do not talk to the running instance of the application (so if there's networking between pods, that would need to be mocked somehow, like we did with MongoDB). We set this variable here for the time being. It's not the best strategy, but gets the error to go away.
  process.env.JWT_KEY = "fehuiuw";

  mongo = await MongoMemoryServer.create();
  // Get the URI from the instance that was just created in memory.
  const mongoUri = mongo.getUri();

  // Get mongoose to connect to that in-memory DB server.
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  // The mocked nats-wrapper is going to be used in all test files. We want to clear this mock between each test so the data from one test isn't passed to the other test.
  jest.clearAllMocks();

  // Delete all data in the in-memory Db before each test.
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

// Create a global signin function to be accessed by all test files.
// Cross service requests (reaching out to the auth service to sign in) should be avoided within tests. Tests must be self contained.
global.signin = () => {
  const email = "test@test.com";
  const id = new mongoose.Types.ObjectId().toHexString();

  // Build JWT payload
  const payload = {
    email,
    id,
  };

  // Create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object
  const session = { jwt: token };

  // Turn the session to JSON
  const sessionJSON = JSON.stringify(session);

  // Turn JSON to base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return cookie with encoded data
  // When a reuqest is sent from the browser, this is how the cookie header on the request looks.
  const cookie = [`session=${base64}`];

  return cookie;
};
