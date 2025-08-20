//testing dog Routes using supertest, chai, mocha
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
//import data schemas
const { RegisteredDog } = require("../models/DogRegModel");

//connect to database before each test
beforeEach(async function () {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
});

//disconnect from database after each test
afterEach(async function () {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});

describe("Routes for dog endpoints", () => {
  describe("Registering a dog", () => {
    it("should allow owner to register dog for adoption", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      //successful login
      expect(res1.status).to.equal(200);
      //initialize a token for logged in user
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      //register a dog for adoption
      const res2 = await request(app)
        .post("/registermydog")
        .send({ name: "Teddy", description: "loves to play" })
        .set("Cookie", `jwt=${token}`);
      //dog has been registered successfully
      expect(res2.status).to.equal(201);
      expect(res2.body.msg).to.equal("Successfully registered Teddy");
    });
    it("should allow another owner to register dog for adoption", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      //login successful
      expect(res1.status).to.equal(200);
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      //register a dog
      const res2 = await request(app)
        .post("/registermydog")
        .send({ name: "Kenny", description: "loves to jump high" })
        .set("Cookie", `jwt=${token}`);
      //dog has been registered successfully
      expect(res2.status).to.equal(201);
      expect(res2.body.msg).to.equal("Successfully registered Kenny");
    });
    it("if user not logged in cannot register dog", async () => {
      const res2 = await request(app)
        .post("/registermydog")
        .send({ name: "Tyler", description: "loves to play at the park" });
      expect(res2.status).to.equal(400);
      expect(res2.body.msg).to.equal("Please log in");
    });
  });
  describe("Deleting a registered dog", async () => {
    it("Testing deleting a dog registered by owner candyman 200 OK", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });

      expect(res1.status).to.equal(200);
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res3 = await request(app)
        .delete(`/deletemydog`)
        .send({ id: "68a600ba27d1f04fb9910df5" })
        .set("Cookie", `jwt=${token}`);

      expect(res3.body.msg).to.equal(
        `Successfully deleted milly at id 68a600ba27d1f04fb9910df5`
      );
      expect(res3.status).to.equal(200);
      const deleteDogFromDatabase = await RegisteredDog.findOne({
        _id: "68a600ba27d1f04fb9910df5",
      });
      expect(deleteDogFromDatabase).to.be.null;
    });
    it("Testing deleting a dog registered by a different owner", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      expect(res1.status).to.equal(200);
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res3 = await request(app)
        .delete(`/deletemydog`)
        .send({ id: "68a602276147912cc1a84a2b" })
        .set("Cookie", `jwt=${token}`);

      expect(res3.body.msg).to.equal(
        `Successfully deleted kenny at id 68a602276147912cc1a84a2b`
      );
      expect(res3.status).to.equal(200);
      const deleteDogFromDatabase = await RegisteredDog.findOne({
        _id: "68a602276147912cc1a84a2b",
      });
      expect(deleteDogFromDatabase).to.be.null;
    });
  });
  describe("Getting registered dogs for an owner", () => {
    it("getting registered dogs for candyman", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      expect(res1.status).to.equal(200);
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .get("/registereddogs/getmydogs")
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(200);
      expect(res2.body.registeredDogs).to.have.lengthOf(3);
    });
  });
  describe("Adopting Dogs", () => {
    it("enter dog id to adopt a dog", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      expect(res1.status).to.equal(200);
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .put("/adoptdog")
        .send({ message: "Thank you!" })
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(400);
      expect(res2.body.errors.id).to.equal(`Please enter a dog id`);
    });
    it("adopting sallymae", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      expect(res1.status).to.equal(200);

      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .put("/adoptdog")
        .send({
          message: "Thank you for sallymae!",
          id: "68a601d8363a6d060a14fe1c",
        })
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(200);
      expect(res2.body.msg).to.equal(
        "Successfully adopted 68a601d8363a6d060a14fe1c and sent message to 68a5fc82d771acacb2c6f4f9"
      );
    });
  });
  describe("getting adopted dogs", () => {
    it("getting adopted dogs for honeycake", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .get("/adopteddogs/getmydogs")
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(200);
      expect(res2.body.AdoptedDogs).to.have.lengthOf(3);
    });
  });
  describe("getting all registered dogs", () => {
    it("getting all dogs", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .get("/registereddogs/getalldogs")
        .set("Cookie", `jwt=${token}`);
      expect(res2.status).to.equal(200);
      expect(res2.body.AllRegisteredDogs).to.have.lengthOf(3);
    });
  });
});
