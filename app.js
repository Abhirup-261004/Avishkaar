const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const MongoStore = require("connect-mongo");
const ejslayouts = require("express-ejs-layouts");

const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const communityRoutes = require("./routes/community");
const prescriptionRouter = require("./routes/prescription");
const mapRoutes = require("./routes/map");

dotenv.config();
const app = express();

/* ------------------------------
   🔹 SESSION STORE (Mongo)
------------------------------ */
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
});
store.on("error", (e) => {
  console.log("SESSION STORE ERROR:", e);
});

/* ------------------------------
   🔹 EXPRESS SESSION
------------------------------ */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

/* ------------------------------
   🔹 CONNECT MONGODB
------------------------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* ------------------------------
   🔹 EJS VIEW ENGINE
------------------------------ */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(ejslayouts);
app.set("layout", "layouts/boilerplate.ejs");

/* ------------------------------
   🔹 MIDDLEWARES
------------------------------ */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

/* ------------------------------
   🔹 GLOBAL VARIABLES
------------------------------ */
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  // after removing passport, store login data in session
  res.locals.currentUser = req.session.user || null;

  next();
});

/* ------------------------------
   🔹 ROUTES
------------------------------ */
app.use("/", userRoutes);
app.use("/", chatRoutes);
app.use("/community", communityRoutes);
app.use("/map", mapRoutes);
app.use("/api/prescription", prescriptionRouter);

/* ------------------------------
   🔹 SERVER
------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

