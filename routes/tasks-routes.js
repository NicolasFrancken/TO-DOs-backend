const express = require("express");
const { check } = require("express-validator");

const tasksControllers = require("../controllers/tasks-controllers");

const router = express.Router();

const {
  getTasksByUserId,
  createTask,
  updateTask,
  deleteTask,
  updateCheckTask,
} = tasksControllers;

router.get("/user/:userid", getTasksByUserId);

router.post("/", [check("description").isLength({ min: 1 })], createTask);

router.patch(
  "/:taskid",
  [check("description").isLength({ min: 1 })],
  updateTask
);

router.delete("/:taskid", deleteTask);

router.put("/:taskid", updateCheckTask);

module.exports = router;
