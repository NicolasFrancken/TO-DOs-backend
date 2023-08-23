const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //"unique" hace que el email no se pueda repetir
  password: { type: String, required: true, minlength: 6 },
  tasks: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }], //con el array le digo a mongoose que son varios objetos no solo uno
});

userSchema.plugin(uniqueValidator); //agrego otro package al model

module.exports = mongoose.model("User", userSchema);
