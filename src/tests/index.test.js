const request = require("supertest");
const app = require("../server");
require("dotenv").config();

describe("GET /", () => {
  it("should return a random quote", async () => {
    return request(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
});
