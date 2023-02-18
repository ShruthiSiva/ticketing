// This starts up a copy of MongoDB in memory. This allows us to run multiple test suites at the same time across different projects without having them all reach out to the same copy of Mongo.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  var signup: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
  // See signup.test.ts for explanation.
  process.env.JWT_KEY = "fehuiuw";

  mongo = await MongoMemoryServer.create();
  // Get the URI from the instance that was just created in memory.
  const mongoUri = mongo.getUri();

  // Get mongoose to connect to that in-memory DB server.
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
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
global.signup = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
