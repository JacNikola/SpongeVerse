const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// @desc Login Page
// @route GET /
router.get("/", ensureGuest, (req, res) => {
  // res.sendFile(path.join(__dirname + '/../views/login.html'));

  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

// @desc metaverse
// @route GET /metaverse
router.get("/metaverse", ensureAuth, async (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/metaverse");
  }
);

// @desc    Logout User
// @route   /auth/logout
router.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
