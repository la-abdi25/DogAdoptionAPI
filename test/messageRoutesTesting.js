//testing message Routes using supertest, chai, mocha
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Messages = require("../models/MessageModel");
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

describe("Routes for messages sent to orignal dog owners", () => {
  it("recieved messages by candyman", async () => {
    const res1 = await request(app).post("/login").send({
      username: "candyman",
      password: "test1234",
    });

    const cookie = res1.headers["set-cookie"][0];
    const token = cookie.split("jwt=")[1].split(";")[0];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    expect(res1.status).to.equal(200);
    //logged in user recieved messages
    const res3 = await request(app)
      .get(`/recmessages`)
      .set("Cookie", `jwt=${token}`);

    const messages = await Messages.find({ sentTo: decodedToken.id });
    expect(messages).to.be.an("array").that.is.empty;
    expect(res3.body.messages).to.have.lengthOf(0);
  });

  it("sent messages by candyman", async () => {
    const res1 = await request(app).post("/login").send({
      username: "candyman",
      password: "test1234",
    });
    const cookie = res1.headers["set-cookie"][0];
    const token = cookie.split("jwt=")[1].split(";")[0];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    expect(res1.status).to.equal(200);
    //logged in user sent messages
    const res3 = await request(app)
      .get(`/sentmessages`)
      .set("Cookie", `jwt=${token}`);

    const messages = await Messages.find({ sentTo: decodedToken.id });
    expect(messages).to.be.an("array").that.is.empty;
    expect(res3.body.messages).to.have.lengthOf(0);
  });
});
