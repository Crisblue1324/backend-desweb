const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    telefono: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    googleId: {type: String, default: null}
}, {timestamps: true});

authSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // No encriptar si es usuario de Google
    if (this.password.startsWith("google-oauth-")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

authSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Auth", authSchema);