const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const tasksRoutes = require("./routes/tasks-routes");
const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");
const { verifyToken } = require("./middlewares/auth");

require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://mytodos-webapp.netlify.app",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/tasks", tasksRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  next(new HttpError("Could not find this route", 404));
}); //esto va a funcionar si las rutas anteriores no devolvieron una respuesta (basicamente si el path no existe)

app.use((error, req, res, next) => {
  if (res.headerSent) {
    //con esto me fijo si ya se mando un request
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error ocurred!" });
});

mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(port, () => {
      console.log("listening");
    });
  })
  .catch((e) => {
    throw new HttpError("Unable to connect to database", 503);
  });
