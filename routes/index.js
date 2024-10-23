const router = require("express").Router();

//! Auth Router
router.use("/api/v1/auth", require("./Auth.js"));

//! Courses Router
router.use("/api/v1/course", require("./Courses.js"));

//! Enrollment Router
router.use("/api/v1/enrollment", require("./Enrollment.js"));

//! Grade Router
router.use("/api/v1/grade", require("./Grade.js"));

module.exports = router;
