const { Router } = require("express");
const router = Router();
const { Op, fn, col, literal } = require("sequelize");

/**
 * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 * @returns Profile
 */
router.get("/best-profession", async (req, res) => {
  const {
    Job: jobRepo,
    Contract: contractRepo,
    Profile: profileRepo,
  } = req.app.get("models");
  const { start, end } = req.query;

  if (!start || !end) return res.status(400).end();

  const query = await jobRepo.findOne({
    attributes: [[fn("sum", col("price")), "total"], "paid", "paymentDate"],
    where: {
      paymentDate: { [Op.between]: [start, end] },
    },
    include: {
      model: contractRepo,
      include: {
        model: profileRepo,
        association: "Contractor",
      },
    },
    group: ["Contract.ContractorId"],
    order: literal("total DESC"),
  });

  if (!query) return res.status(404).end();

  const profile = query.Contract.Contractor;

  res.json(profile);
});

/**
 * Returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
 * @returns Profiles
 */
router.get("/best-clients", async (req, res) => {
  const {
    Job: jobRepo,
    Contract: contractRepo,
    Profile: profileRepo,
  } = req.app.get("models");
  const { start, end, limit } = req.query;

  if (!start || !end) return res.status(400).end();

  const validLimit = limit || 2;

  const query = await jobRepo.findAll({
    attributes: [[fn("sum", col("price")), "total"], "paid", "paymentDate"],
    where: {
      paymentDate: { [Op.between]: [start, end] },
    },
    include: {
      model: contractRepo,
      include: {
        model: profileRepo,
        association: "Client",
      },
    },
    group: ["Contract.ClientId"],
    order: literal("total DESC"),
    limit: validLimit,
  });

  if (!query) return res.status(404).end();
  const profiles = query.map((q) => q.Contract.Client);

  res.json(profiles);
});

module.exports = router;
