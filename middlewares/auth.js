const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const generateToken = () => {
  const token = jwt.sign({}, secretKey);
  return token;
};

const verifyToken = (req, res, next) => {
  let token = req.cookies.token;
  if (!token) {
    return next(new HttpError("Access denied", 401));
  }

  try {
    jwt.verify(token, secretKey);
    next();
  } catch (e) {
    return next(new HttpError("Invalid Token", 401));
  }
};

exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
