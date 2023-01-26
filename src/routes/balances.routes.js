const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { Contract } = require("../repos/model");
const router = Router();
const { Op } = require("sequelize");
const { mapMoneyDecimals } = require("../utils");

/**
 * Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
 * @returns Profile
 */
router.post("/deposit/:userId", getProfile, async (req, res) => {
  const {
    Contract: contractRepo,
    Job: jobRepo,
    Profile: profileRepo,
  } = req.app.get("models");
  const { profile } = req;
  const { amount } = req.body;

  const contractsToPay = await contractRepo.findAll({
    where: {
      [Op.or]: [{ ClientId: profile.id }],
      [Op.and]: [{ status: { [Op.eq]: Contract.IN_PROGRESS_STATUS } }],
    },
    include: {
      model: jobRepo,
      where: {
        [Op.or]: [{ paid: false }, { paid: null }],
      },
    },
  });

  const totalOwned = contractsToPay.reduce((accumulator, current) => {
    return accumulator + current.Jobs.reduce((sum, job) => sum + job.price, 0);
  }, 0);

  const maxAllowedToDeposit = mapMoneyDecimals(totalOwned * 0.25);

  if (amount > maxAllowedToDeposit) return res.status(400).end();

  await profileRepo.update(
    {
      balance: mapMoneyDecimals(profile.balance + amount),
    },
    { where: { id: profile.id } }
  );

  res.json({
    balance: profile.balance + amount,
  });
});

module.exports = router;
