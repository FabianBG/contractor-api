const app = require("../../app");
const { contractBuilder } = require("../../factories/contract.factory");
const { getTestProfiles } = require("../../testUtils");
const { Contract, Job } = require("../../repos/model");
const request = require("supertest");
const { jobBuilder } = require("../../factories/job.factory");
const { mapMoneyDecimals } = require("../../utils");
const server = app.listen();

beforeAll(async () => {
  jest.useFakeTimers();
});

afterAll(() => server.close());

describe("Balance routes", () => {
  let clientProfile, contractorProfile1, job1, job2, job3, maxAllowed;

  beforeAll(async () => {
    const result = await getTestProfiles();
    clientProfile = result.clientProfile;
    contractorProfile1 = result.contractorProfile1;

    const contract1 = await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
        status: Contract.IN_PROGRESS_STATUS,
      })
    );

    job1 = await Job.create(
      jobBuilder({
        ContractId: contract1.id,
        paid: false,
      })
    );

    const contract2 = await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
        status: Contract.IN_PROGRESS_STATUS,
      })
    );

    job2 = await Job.create(
      jobBuilder({
        ContractId: contract2.id,
        paid: false,
      })
    );

    job3 = await Job.create(
      jobBuilder({
        ContractId: contract2.id,
        paid: null,
      })
    );

    maxAllowed = mapMoneyDecimals(
      (job1.price + job2.price + job3.price) * 0.25
    );
  });

  describe("post deposit", () => {
    test("should fail if the profile do not exist", async () => {
      const response = await request(server)
        .post("/balances/deposit/-1")
        .send({
          amount: maxAllowed - 1,
        });

      expect(response.status).toBe(404);
    });

    test("should fail if the amount is bigger that the .25 of all the jobs", async () => {
      const response = await request(server)
        .post(`/balances/deposit/${clientProfile.id}`)
        .send({
          amount: maxAllowed + 1,
        });

      expect(response.status).toBe(400);
    });

    test("should fail if the amount 0 or negative", async () => {
      const response = await request(server)
        .post(`/balances/deposit/${clientProfile.id}`)
        .send({
          amount: -100,
        });

      expect(response.status).toBe(400);
    });

    test("should post a deposit to a user's account", async () => {
      const response = await request(server)
        .post(`/balances/deposit/${clientProfile.id}`)
        .send({
          amount: maxAllowed - 1,
        });

      expect(response.status).toBe(200);
    });
  });
});
