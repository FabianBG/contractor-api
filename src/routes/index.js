const { Router } = require("express");
const contractRoutes = require("./contract.routes");
const jobRoutes = require("./job.routes");
const balanceRoutes = require("./balances.routes");
const adminRoutes = require("./admin.routes");
const router = Router();

router.use("/contracts", contractRoutes);
router.use("/jobs", jobRoutes);
router.use("/balances", balanceRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
