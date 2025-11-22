const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  dni: { type: String, required: true, unique: true },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  genero: { type: String, enum: ["Masculino", "Femenino"], required: true },
  ciudad: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
