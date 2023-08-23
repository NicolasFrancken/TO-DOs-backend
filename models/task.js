const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: { type: String, required: true },
  isChecked: { type: Boolean, default: false },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, //con esto establezco que el creator tendra el el ID del user que genera mongoose
});

module.exports = mongoose.model("Task", taskSchema); //"places" va a ser el nombre de la collection
