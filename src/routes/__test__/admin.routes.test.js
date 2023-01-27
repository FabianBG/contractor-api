const app = require("../../app");
const { contractBuilder } = require("../../factories/contract.factory");
const { getTestProfiles } = require("../../testUtils");
const { Contract, Job } = require("../../repos/model");
const request = require("supertest");
const { jobBuilder } = require("../../factories/job.factory");
const server = app.listen();

beforeAll(async () => {
  jest.useFakeTimers();
});

afterAll(() => server.close());

const addOffset = (offset) => {
  return new Date(new Date().getTime() + offset).toISOString();
};

describe("Admin routes", () => {
  let clientProfile, contractorProfile1;
  const currentDate = addOffset(0);
  const start = addOffset(-100);
  const end = addOffset(+100);

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

    await Job.create(
      jobBuilder({
        ContractId: contract1.id,
        paid: true,
        paymentDate: currentDate,
      })
    );

    const contract2 = await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
        status: Contract.IN_PROGRESS_STATUS,
      })
    );

    await Job.create(
      jobBuilder({
        ContractId: contract2.id,
        paid: true,
        paymentDate: currentDate,
      })
    );

    await Job.create(
      jobBuilder({
        ContractId: contract2.id,
        paid: null,
      })
    );

    await Job.create(
      jobBuilder({
        ContractId: contract2.id,
        paid: true,
        paymentDate: addOffset(-1),
      })
    );
  });

  describe("get best profession", () => {
    test("should return the best professions", async () => {
      const response = await request(server).get(
        `/admin/best-profession?start=${start}&end=${end}`
      );
      expect(response.status).toBe(200);
    });

    test("should get nothing if is out of range", async () => {
      const response = await request(server).get(
        `/admin/best-profession?start=${addOffset(1000000)}&end=${addOffset(
          2000000
        )}`
      );
      expect(response.status).toBe(404);
    });
  });

  describe("get best clients", () => {
    test("should return the best professions", async () => {
      const response = await request(server).get(
        `/admin/best-clients?start=${start}&end=${end}`
      );
      expect(response.status).toBe(200);
    });

    test("should get nothing if is out of range", async () => {
      const response = await request(server).get(
        `/admin/best-clients?start=${addOffset(1000000)}&end=${addOffset(
          2000000
        )}`
      );
      expect(response.status).toBe(200);
    });
  });
});
