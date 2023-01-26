const { Router } = require("express");
const contractRoutes = require("./contract.routes");
const router = Router();

router.use("/contracts", contractRoutes);

module.exports = router;
