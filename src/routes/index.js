const { Router } = require("express");
const contractRoutes = require("./contract.route");
const router = Router();

router.use("/contracts", contractRoutes);

module.exports = router;
