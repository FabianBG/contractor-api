const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { Contract, Job } = require("../repos/model");
const router = Router();
const { Op, transaction } = require("sequelize");

/**
 * Get all unpaid jobs for a user
 * @returns unpaid Jobs
 */
router.get("/unpaid", getProfile, async (req, res) => {
  const { Contract: contractRepo } = req.app.get("models");
  const { profile } = req;

  const contracts = await contractRepo.findAll({
    where: {
      [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
      [Op.and]: [{ status: { [Op.ne]: Contract.TERMINATED_STATUS } }],
    },
    include: Job,
  });

  if (!contracts) return res.status(404).end();

  const unpaidJobs = contracts.reduce((accumulator, current) => {
    const unpaid = current.jobs.filter((j) => !j.paid);

    return [...accumulator, ...unpaid];
  }, []);

  res.json(unpaidJobs);
});

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
 * @returns Job
 */
router.get("/:id/pay", getProfile, async (req, res) => {
  const { Job: jobRepo, Profile: profileRepo } = req.app.get("models");
  const { profile } = req;
  const { id } = req.params;

  const job = await jobRepo.findOne({ where: { id }, include: Contract });
  const { contract } = job;
  const amount = job.price;

  if (profile.balance < amount) return res.status(400).end();

  if (contract.ClientId !== profile.id) return res.status(400).end();

  if (job.paid) return res.status(400).end();

  const contractorProfile = await profileRepo.findOne({
    where: { id: contract.ContractorId },
  });

  const balanceClient = profile.balance - amount;
  const balanceContractor = contractorProfile.balance + amount;

  try {
    const updated = await transaction(async (t) => {
      await profileRepo.update(
        {
          balance: balanceClient,
        },
        {
          where: { id: profile.id },
          transaction: t,
        }
      );
      await profileRepo.update(
        {
          balance: balanceContractor,
        },
        {
          where: { id: contractorProfile.id },
          transaction: t,
        }
      );
      const updated = await jobRepo.update(
        {
          paid: true,
          paymentDate: new Date().toISOString(),
        },
        {
          where: { id: job.id },
          transaction: t,
        }
      );

      return updated;
    });

    res.json(updated);
  } catch (error) {
    return res.status(500).end();
  }
});
