import 'graphql-import-node'; // allow import of *.graphql
import request from 'supertest';
import server from './server';


afterAll(() => {
  return server.close();
});

describe("Test server loads", () => {
  test("should not be available", (done) => {
    request(server)
      .get("/")
      .expect(404, done);
  });
});