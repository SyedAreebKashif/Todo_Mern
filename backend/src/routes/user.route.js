const express = require("express");
const router = express.Router();
const {
  signUp,
  loginUser,
  logoutUser,
  getMe,
} = require("../controllers/user.controllers");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/signup", signUp);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;

