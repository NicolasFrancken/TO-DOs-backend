const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Task = require("../models/task");
const User = require("../models/user");

const getTasksByUserId = async (req, res, next) => {
  const userId = req.params.userid;

  let tasks;
  try {
    tasks = await Task.find({ creator: userId });
  } catch (e) {
    const error = new HttpError("Something went wrong, please try again", 404);
    return next(error);
  }

  if (!tasks || tasks.length === 0) {
    return next(new HttpError("Create your first task!"));
  }

  res.json({ tasks: tasks.map((t) => t.toObject({ getters: true })) });
};

const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Cannot create task with no content", 422));
  }

  const { description, creator } = req.body;

  const createdTask = new Task({
    description,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    const error = new HttpError("Creating task failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Something went wrong, please try again", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTask.save({ session: sess });
    user.tasks.push(createdTask); //este "push" es una funcion de mongoose, no es el "push" normal. este "push" solo agrega el ID del place al user
    await user.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (e) {
    const error = new HttpError("Creating task failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ task: createdTask.toObject({ getters: true }) });
};

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check data", 422));
  }

  const { description } = req.body;
  const taskId = req.params.taskid;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (e) {
    const error = new HttpError("Could not update task", 500);
    return next(error);
  }

  task.description = description;

  try {
    await task.save();
  } catch (e) {
    const error = new HttpError("Could not update task", 500);
    return next(error);
  }

  res.status(200).json({ task: task.toObject({ getters: true }) });
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.taskid;

  let task;
  try {
    task = await Task.findById(taskId).populate("creator"); //the process of replacing the specified path in the document of one collection with the actual document from the other collection
  } catch (e) {
    const error = new HttpError("Could not delete task, please try again", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await task.deleteOne({ session: sess });
    task.creator.tasks.pull(task); //este "pull" es de mongoose. quita el ID del place del user
    await task.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    console.log(e);
    const error = new HttpError("Could not delete task, please try again", 500);
    return next(error);
  }

  if (!task) {
    const error = new HttpError("Could not delete task, please try again", 404);
    return next(error);
  }

  res.status(200).json({ message: "Task Deleted" });
};

const updateCheckTask = async (req, res, next) => {
  const taskId = req.params.taskid;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (e) {
    const error = new HttpError("Could not update task, please try again", 500);
    return next(error);
  }

  const { isChecked } = task;

  task.isChecked = !isChecked;

  try {
    await task.save();
  } catch (e) {
    const error = new HttpError("Could not update task, please try again", 500);
    return next(error);
  }

  res.status(200).json({ task: task.toObject({ getters: true }) }); //con "{ getters: true }" convierto el "_id" de mongoose en "id"
};

exports.getTasksByUserId = getTasksByUserId;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.updateCheckTask = updateCheckTask;
