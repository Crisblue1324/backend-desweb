const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Auth = require("../models/auth");

const router = express.Router();

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", async (req, res) => {
    try {
        const {nombre, apellido, email, telefono, password} = req.body;

        const existingUser = await Auth.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "El email ya está registrado"});
        }

        const newUser = new Auth({nombre, apellido, email, telefono, password});
        await newUser.save();

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: {id: newUser._id, nombre: newUser.nombre, email: newUser.email}
        });
    } catch (error) {
        res.status(500).json({message: "Error al registrar", error: error.message});
    }
});

// POST /api/auth/login - Iniciar sesión
router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await Auth.findOne({email});
        if (!user) {
            return res.status(401).json({message: "Credenciales inválidas"});
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({message: "Credenciales inválidas"});
        }

        const token = jwt.sign(
            {id: user._id, email: user.email, nombre: user.nombre},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );

        res.json({
            message: "Login exitoso",
            token,
            user: {id: user._id, nombre: user.nombre, email: user.email}
        });
    } catch (error) {
        res.status(500).json({message: "Error en login", error: error.message});
    }
});

// GET /api/auth/google - Iniciar login con Google
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

// GET /api/auth/google/callback - Callback de Google
router.get("/google/callback",
    passport.authenticate("google", {session: false, failureRedirect: "/login"}),
    (req, res) => {
        // Generar token JWT
        const token = jwt.sign(
            {id: req.user._id, email: req.user.email, nombre: req.user.nombre},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );

        // Redirigir al frontend con el token
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            nombre: req.user.nombre,
            email: req.user.email
        }))}`);
    }
);

module.exports = router;