const express = require("express");
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  authCheck,
} = require("../controllers/AuthController.js");

const { authMiddleware, logout } = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/password-reset", requestPasswordReset);
router.post("/password-reset/:token", resetPassword);
router.get("/authCheck", authMiddleware, authCheck);
router.post("/logout", authMiddleware, logout);

module.exports = router;
