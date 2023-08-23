const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");

const router = express.Router();

const { signup, signin, signout } = usersControllers;

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  signup
);

router.post(
  "/login",
  [check("email").normalizeEmail({ gmail_remove_dots: false })],
  signin
);

router.post("/logout", signout);

module.exports = router;
