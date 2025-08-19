//testing user Routes using supertest, chai, mocha
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");

//connect to database before each test
beforeEach(async function () {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  }
});
//disconnect from database after each test
afterEach(async function () {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});

describe("Routes for users", () => {
  describe("Get logout route", () => {
    it("should return the logout page with a status code of 200", async () => {
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });

      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .get("/logout")
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(200);
    });
  });

  describe("Registration Routes", () => {
    it("no username or password entered", async () => {
      const res = await request(app).post("/register").send({
        username: "",
        password: "",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors.username).to.equal(
        `Please enter a valid username`
      );
      expect(res.body.errors.password).to.equal(
        `Please enter a valid password`
      );
    });
    it("should return user registered successfully", async () => {
      const res = await request(app).post("/register").send({
        username: "honeycake",
        password: "test1234",
      });

      expect(res.status).to.equal(201);
      expect(res.body.msg).to.equal(
        `Successfully registered user id honeycake`
      );
    });

    it("duplicate username registered with", async () => {
      const res = await request(app).post("/register").send({
        username: "candyman",
        password: "test1234",
      });
      expect(res.status).to.equal(400);
      expect(res.body.errors.username).to.equal(
        `Username already exists, Please enter a different username`
      );
    });

    it("minimum password length of 6", async () => {
      const res = await request(app).post("/register").send({
        username: "hellotiger",
        password: "test1",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors.password).to.equal(
        `Please enter a minimum character length of 6`
      );
    });
  });
  describe("Login Routes", async () => {
    it("login successful", async () => {
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });

      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);

      expect(res1.body.msg).to.equal(`Logged in candyman successfully`);
    });
    it("incorrect password", async () => {
      const res = await request(app).post("/login").send({
        username: "candyman",
        password: "test123",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors.password).to.equal(
        `Please enter the correct password`
      );
    });
    it("incorrect username", async () => {
      const res = await request(app).post("/login").send({
        username: "candyma",
        password: "test123",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors.username).to.equal(
        `Please enter the correct username`
      );
    });
  });
});
