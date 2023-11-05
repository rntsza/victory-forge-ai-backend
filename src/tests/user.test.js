const request = require("supertest");
const app = require("../server");
require("dotenv").config();

describe("GET /users", () => {
  it("should return all users", async () => {
    return request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
});
