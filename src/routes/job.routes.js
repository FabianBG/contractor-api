const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { Contract } = require("../repos/model");
const router = Router();
const { Op } = require("sequelize");
const { mapMoneyDecimals } = require("../utils");

/**
 * Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.
 * @returns unpaid Jobs
 */
router.get("/unpaid", getProfile, async (req, res) => {
  const { Contract: contractRepo, Job: jobRepo } = req.app.get("models");
  const { profile } = req;

  const contracts = await contractRepo.findAll({
    where: {
      [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
      [Op.and]: [{ status: { [Op.ne]: Contract.TERMINATED_STATUS } }],
    },
    include: {
      model: jobRepo,
      where: {
        [Op.or]: [{ paid: false }, { paid: null }],
      },
    },
  });

  if (!contracts) return res.status(404).end();

  const unpaidJobs = contracts.reduce((accumulator, current) => {
    return [...accumulator, ...current.Jobs];
  }, []);

  res.json(unpaidJobs);
});

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
 * @returns Job
 */
router.post("/:id/pay", getProfile, async (req, res) => {
  const {
    Job: jobRepo,
    Profile: profileRepo,
    Contract: contractRepo,
  } = req.app.get("models");
  const { profile } = req;
  const { id } = req.params;

  const job = await jobRepo.findOne({
    where: {
      [Op.and]: [{ id }],
      [Op.or]: [{ paid: false }, { paid: null }],
    },
    include: {
      model: contractRepo,
    },
  });

  if (!job) return res.status(404).end();

  const { Contract: contract } = job;
  const amount = job.price;

  if (profile.balance < amount) return res.status(400).end();

  if (contract.ClientId !== profile.id) return res.status(400).end();

  const contractorProfile = await profileRepo.findOne({
    where: { id: contract.ContractorId },
  });

  const balanceClient = mapMoneyDecimals(profile.balance - amount);
  const balanceContractor = mapMoneyDecimals(
    contractorProfile.balance + amount
  );

  try {
    const connection = req.app.get("sequelize");
    const updated = await connection.transaction(async (t) => {
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
      await jobRepo.update(
        {
          paid: true,
          paymentDate: new Date().toISOString(),
        },
        {
          where: { id: job.id },
          transaction: t,
        }
      );

      return job;
    });

    res.json(updated);
  } catch (error) {
    console.error(error);

    return res.status(500).end();
  }
});

module.exports = router;
