const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const router = Router();

/**
 * Get the user contracts
 * @returns contract by id
 */
router.get("/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const { profile } = req;
  const contract = await Contract.findOne({
    where: { id, ContractorId: profile.id },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
});

module.exports = router;
