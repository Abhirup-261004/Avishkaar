const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
const User = require("./models/user");
const userRoutes=require("./routes/user")

const MongoStore=require("connect-mongo");
const ejslayouts = require("express-ejs-layouts"); // FIXED

dotenv.config();
const app = express();

// Session Store
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
});
store.on("error", (e) => {
  console.log("SESSION STORE ERROR:", e);
});

// Sessions 
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(ejslayouts);
app.set("layout", "layouts/boilerplate.ejs");

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Flash

app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Use local strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
// Serialize / deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + Global Variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});


// Routes
app.use("/", userRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));