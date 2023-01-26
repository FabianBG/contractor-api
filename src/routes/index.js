const { Router } = require("express");
const contractRoutes = require("./contract.routes");
const jobRoutes = require("./job.routes");
const balanceRoutes = require("./balances.routes");
const router = Router();

router.use("/contracts", contractRoutes);
router.use("/jobs", jobRoutes);
router.use("/balances", balanceRoutes);

module.exports = router;
