const app = require("../../app");
const { contractBuilder } = require("../../factories/contract.factory");
const { getTestProfiles } = require("../../testUtils");
const { Contract } = require("../../repos/model");
const request = require("supertest");
const server = app.listen();

let clientProfile, contractorProfile1, contractorProfile2;

beforeAll(async () => {
  jest.useFakeTimers();
  const result = await getTestProfiles();
  clientProfile = result.clientProfile;
  contractorProfile1 = result.contractorProfile1;
  contractorProfile2 = result.contractorProfile2;
});

afterAll(() => server.close());

describe("Contract routes", () => {
  describe("get all", () => {
    beforeAll(async () => {
      await Contract.create(
        contractBuilder({
          ClientId: clientProfile.id,
          ContractorId: contractorProfile1.id,
        })
      );

      await Contract.create(
        contractBuilder({
          ClientId: clientProfile.id,
          ContractorId: contractorProfile1.id,
        })
      );
    });

    test("should get all the user's contracts based on the header profile_id", async () => {
      const response = await request(server)
        .get("/contracts")
        .set("profile_id", clientProfile.id);
      expect(response.status).toBe(200);

      expect(response.body.length).toBe(2);
    });

    test("should get all the user's contracts if only is contractor", async () => {
      const response = await request(server)
        .get("/contracts")
        .set("profile_id", contractorProfile1.id);
      expect(response.status).toBe(200);

      expect(response.body.length).toBe(2);
    });

    test("should get empty if no contracts", async () => {
      const response = await request(server)
        .get("/contracts")
        .set("profile_id", contractorProfile2.id);
      expect(response.status).toBe(200);

      expect(response.body.length).toBe(0);
    });
  });

  describe("get one", () => {
    let contract;
    beforeAll(async () => {
      contract = await Contract.create(
        contractBuilder({
          ClientId: clientProfile.id,
          ContractorId: contractorProfile1.id,
        })
      );
    });

    test("should get one contract by id if the user is the client", async () => {
      const response = await request(server)
        .get(`/contracts/${contract.id}`)
        .set("profile_id", clientProfile.id);
      expect(response.status).toBe(200);

      expect(response.body.id).toBe(contract.id);
    });

    test("should get one contract by id if the user is the contractor", async () => {
      const response = await request(server)
        .get(`/contracts/${contract.id}`)
        .set("profile_id", contractorProfile1.id);
      expect(response.status).toBe(200);

      expect(response.body.id).toBe(contract.id);
    });

    test("should fail if the user is not the contractor or the client", async () => {
      const response = await request(server)
        .get(`/contracts/${contract.id}`)
        .set("profile_id", contractorProfile2.id);
      expect(response.status).toBe(404);
    });
  });
});
