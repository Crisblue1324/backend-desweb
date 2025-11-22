const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Auth = require("../models/auth");

const callbackURL = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : "/api/auth/google/callback";

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await Auth.findOne({email: profile.emails[0].value});

            if (user) {
                return done(null, user);
            }

            user = new Auth({
                nombre: profile.name.givenName || "Usuario",
                apellido: profile.name.familyName || "Google",
                email: profile.emails[0].value,
                telefono: "0000000000",
                password: "google-oauth-" + profile.id,
                googleId: profile.id
            });

            await user.save();
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Auth.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;