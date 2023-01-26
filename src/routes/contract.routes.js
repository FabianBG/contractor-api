const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { Contract } = require("../repos/model");
const router = Router();
const { Op } = require("sequelize");

/**
 * Get the all non terminated user's contracts
 * @returns non terminated contracts
 */
router.get("/", getProfile, async (req, res) => {
  const { Contract: contractRepo } = req.app.get("models");
  const { profile } = req;

  const contracts = await contractRepo.findAll({
    where: {
      ContractorId: profile.id,
      status: { [Op.ne]: Contract.TERMINATED_STATUS },
    },
  });

  if (!contracts) return res.status(404).end();

  res.json(contracts);
});

/**
 * Get one user's contracts by id
 * @returns contract by id
 */
router.get("/:id", getProfile, async (req, res) => {
  const { Contract: contractRepo } = req.app.get("models");
  const { id } = req.params;
  const { profile } = req;
  const contract = await contractRepo.findOne({
    where: { id, ContractorId: profile.id },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
});

module.exports = router;
