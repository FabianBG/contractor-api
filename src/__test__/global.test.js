const { initDB } = require("../testUtils");
const app = require("../app");

beforeAll(async () => {
  await initDB();
});

describe("Server init", () => {
  let server;

  beforeAll(async () => {
    jest.useFakeTimers();
  });

  afterAll(() => server.close());

  test("Server inits correctly", () => {
    server = app.listen();

    expect(server).toBeDefined();
  });
});
