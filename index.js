require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const {graphqlHTTP} = require("express-graphql");
const schema = require("./graphql/schema");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Configurar sesiones para Passport
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error al conectar MongoDB:", err));

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true,
}));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));