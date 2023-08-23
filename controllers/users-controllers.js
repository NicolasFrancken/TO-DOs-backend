const { validationResult } = require("express-validator");
const { serialize } = require("cookie");
const bcrypt = require("bcryptjs");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const { generateToken } = require("../middlewares/auth");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid credentials, please try again", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const error = new HttpError("Sign up failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("Email already in use", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    tasks: [],
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError("Sign up up failed, please try again", 500);
    return next(error);
  }

  const token = await generateToken();
  const serialized = serialize("token", token, {
    maxAge: 3600000,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: "localhost",
  });

  res.setHeader("Set-Cookie", serialized);

  res.status(201).json({
    message: "Account created!",
    user: createdUser.toObject({ getters: true }),
  });
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const error = new HttpError("Sign in up failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials, please try again", 422);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    const error = new HttpError("There was an error, please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials, please try again", 401);
    return next(error);
  }

  const token = await generateToken();
  const serialized = serialize("token", token, {
    maxAge: 3600000,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: "localhost",
  });

  res.setHeader("Set-Cookie", serialized);

  res.status(201).json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

const signout = async (req, res, next) => {
  const serialized = serialize("token", "", {
    maxAge: 0,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: "localhost",
  });

  res.setHeader("Set-Cookie", serialized);

  res.sendStatus(200);
};

exports.signup = signup;
exports.signin = signin;
exports.signout = signout;
