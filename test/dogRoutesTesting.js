//testing dog Routes using supertest, chai, mocha
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
//import data schemas
const { RegisteredDog } = require("../models/DogRegModel");
const Messages = require("../models/MessageModel");

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

describe("Routes for dog endpoints", () => {
  describe("Registering a dog", () => {
    it("should allow owner to register dog for adoption", async () => {
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
        .post("/registerdogs")
        .send({ name: "Milly", description: "loves to play" })
        .set("Cookie", `jwt=${token}`);
      //dog has been registered successfully
      expect(res2.status).to.equal(201);
      expect(res2.body.msg).to.equal("Successfully registered Milly");
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
        .post("/registerdogs")
        .send({ name: "SallyMae", description: "loves to jump high" })
        .set("Cookie", `jwt=${token}`);
      //dog has been registered successfully
      expect(res2.status).to.equal(201);
      expect(res2.body.msg).to.equal("Successfully registered SallyMae");
    });
    it("if user not logged in cannot register dog", async () => {
      const res2 = await request(app)
        .post("/registerdogs")
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
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      const id = "689cc0b4975d76b087856498";
      const res3 = await request(app)
        .delete(`/registerdogs/${id}`)
        .set("Cookie", `jwt=${token}`);
      expect(res3.body.msg).to.equal(`Successfully deleted milly at id ${id}`);
      expect(res3.status).to.equal(200);
      const deleteDogFromDatabase = await RegisteredDog.findOne({ _id: id });
      expect(deleteDogFromDatabase).to.be.null;
    });
    it("Testing deleting a dog registered by a different owner", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      const id = "689cc0d4c7d9bd187a55d328";
      const res3 = await request(app)
        .delete(`/registerdogs/${id}`)
        .set("Cookie", `jwt=${token}`);
      expect(res3.status).to.equal(400);
      expect(res3.body.err).to.equal(
        "Cannot delete a dog you did not register"
      );
      const deleteDogFromDatabase = await RegisteredDog.findOne({ _id: id });
      expect(deleteDogFromDatabase).to.be.not.null;
    });
  });
  describe("Getting registered dogs for an owner", () => {
    it("getting registered dogs for honeycake", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "honeycake",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      const id = "689cbcccbe6f1dafb9e3ba9b";
      const res3 = await request(app)
        .get(`/registerdogs/${id}`)
        .set("Cookie", `jwt=${token}`);
      expect(res3.status).to.equal(200);
      const findUser = await RegisteredDog.find({ registeredBy: id });
      expect(findUser).to.have.lengthOf(5);
    });
    it("getting registered dogs for candyman", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      const id = "689cbccdbe6f1dafb9e3ba9e";
      const res3 = await request(app)
        .get(`/registerdogs/${id}`)
        .set("Cookie", `jwt=${token}`);
      expect(res3.status).to.equal(200);
      const findUser = await RegisteredDog.find({ registeredBy: id });
      expect(findUser).to.have.lengthOf(2);
    });
  });
  describe("Adopting Dogs", () => {
    it("adopting sallymae", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      //adopting sally mae
      const sallyId = "689cc054e6cf56aa634c7054";
      const dog = await RegisteredDog.findOne({ _id: sallyId });
      const res3 = await request(app)
        .put(`/adoptdogs/${sallyId}`)
        .send({
          message: "Thank you, Sally is great!",
        })
        .set("Cookie", `jwt=${token}`);
      expect(res3.body.msg).to.equal(
        `Successfully adopted ${sallyId} and sent message to ${dog.registeredBy}`
      );
      const messages = await Messages.find({ sentToName: dog.registeredBy });
      expect(messages).to.be.not.null;
    });
  });
  describe("getting adopted dogs", () => {
    it("getting adopted dogs by a particular owner", async () => {
      //login
      const res1 = await request(app).post("/login").send({
        username: "candyman",
        password: "test1234",
      });
      const cookie = res1.headers["set-cookie"][0];
      const token = cookie.split("jwt=")[1].split(";")[0];
      const res2 = await request(app)
        .post("/login")
        .set("Cookie", `jwt=${token}`);
      //successful login
      expect(res2.status).to.equal(200);
      const userId = "689cbccdbe6f1dafb9e3ba9e";
      const res3 = await request(app)
        .get(`/adoptdogs/${userId}`)
        .set("Cookie", `jwt=${token}`);
      expect(res3.body.AdoptedDogs).to.have.lengthOf(3);
    });
  });
});
