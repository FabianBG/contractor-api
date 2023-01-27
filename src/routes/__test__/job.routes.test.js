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

describe("Job routes", () => {
  let clientProfile,
    contractorProfile1,
    contractorProfile2,
    inProgress,
    job,
    paidJob;

  beforeAll(async () => {
    const result = await getTestProfiles();
    clientProfile = result.clientProfile;
    contractorProfile1 = result.contractorProfile1;
    contractorProfile2 = result.contractorProfile2;

    await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
      })
    );

    const terminated = await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
        status: Contract.TERMINATED_STATUS,
      })
    );

    paidJob = await Job.create(
      jobBuilder({
        ContractId: terminated.id,
        paid: true,
      })
    );

    inProgress = await Contract.create(
      contractBuilder({
        ClientId: clientProfile.id,
        ContractorId: contractorProfile1.id,
        status: Contract.IN_PROGRESS_STATUS,
      })
    );

    job = await Job.create(
      jobBuilder({
        ContractId: inProgress.id,
        paid: false,
      })
    );

    await Job.create(
      jobBuilder({
        ContractId: inProgress.id,
        paid: null,
      })
    );
  });

  describe("get all", () => {
    test("should get all the unpaid jobs", async () => {
      const response = await request(server)
        .get("/jobs/unpaid")
        .set("profile_id", clientProfile.id);
      expect(response.status).toBe(200);

      expect(response.body.length).toBe(2);
    });

    test("should get empty if no contracts", async () => {
      const response = await request(server)
        .get("/jobs/unpaid")
        .set("profile_id", contractorProfile2.id);
      expect(response.status).toBe(200);

      expect(response.body.length).toBe(0);
    });
  });

  describe("pay a job", () => {
    test("should fail if no job", async () => {
      const response = await request(server)
        .post("/jobs/-1/pay")
        .set("profile_id", clientProfile.id);

      expect(response.status).toBe(404);
    });

    test("should fail if the job is paid", async () => {
      const response = await request(server)
        .post(`/jobs/${paidJob.id}/pay`)
        .set("profile_id", clientProfile.id);

      expect(response.status).toBe(404);
    });

    test("should fail if the job value is bigger than the balance", async () => {
      const jobWithBiggerValue = await Job.create(
        jobBuilder({
          ContractId: inProgress.id,
          paid: false,
          price: clientProfile.balance * 10,
        })
      );

      const response = await request(server)
        .post(`/jobs/${jobWithBiggerValue.id}/pay`)
        .set("profile_id", clientProfile.id);

      expect(response.status).toBe(400);
    });

    test("should fail if the job do not belong to the client", async () => {
      const response = await request(server)
        .post(`/jobs/${job.id}/pay`)
        .set("profile_id", contractorProfile2.id);

      expect(response.status).toBe(400);
    });

    test("should pay a job", async () => {
      const response = await request(server)
        .post(`/jobs/${job.id}/pay`)
        .set("profile_id", clientProfile.id);
      expect(response.status).toBe(200);

      expect(response.body).toBeDefined();
    });
  });
});
