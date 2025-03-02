const request = require("supertest");
const app = require("../server"); // Ensure correct relative path to server.js
const mongoose = require("mongoose");
const User = require("../models/userModel");

// Cleanup before and after tests
beforeAll(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Authentication API", () => {
  
  let testUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123"
  };

  let token;

  // ✅ Test User Registration
  test("Should register a new user", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send(testUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });

  // ❌ Test Duplicate Registration
  test("Should not allow duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send(testUser);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  // ✅ Test Login with Correct Credentials
  test("Should login user and return token", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  // ❌ Test Login with Wrong Password
  test("Should not login with wrong password", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: testUser.email,
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  // ❌ Test Login with Non-Existent User
  test("Should not login a non-existent user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "notfound@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
