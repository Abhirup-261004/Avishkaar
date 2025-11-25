const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn } = require("../middleware/auth");

// If you have an Activity model, require it here.
// If not, remove the activity-related code below.
// const Activity = require("../models/activity");


// 🌍 Home Page
router.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    pageCSS: ["home"],
    currentUser: req.session.user
  });
});


// 🧾 Register form
router.get("/register", (req, res) => {
  res.render("users/register", {
    hideLayout: true,
    title: "Sign Up",
    pageCSS: ["auth"],
    currentUser: req.session.user
  });
});


// 🧾 Register user (bcrypt)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "Email already registered!");
      return res.redirect("/register");
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    req.flash("success", "Registration successful! Please log in.");
    res.redirect("/login");

  } catch (err) {
    console.log(err);
    req.flash("error", "Registration failed. Try again.");
    res.redirect("/register");
  }
});


// 🔐 Login form
router.get("/login", (req, res) => {
  res.render("users/login", {
    hideLayout: true,
    title: "Sign In",
    pageCSS: ["auth"],
    currentUser: req.session.user
  });
});


// 🔐 Login user (bcrypt)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // store user in session
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username
    };

    req.flash("success", "Welcome back!");
    res.redirect("/");

  } catch (err) {
    console.log(err);
    req.flash("error", "Login failed");
    res.redirect("/login");
  }
});


// 🚪 Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


// 👤 Profile page
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    // If you don’t have Activity model, comment this block:
    /*
    const activities = await Activity.find({ user: req.session.user._id });

    const totals = {
      emitted: activities.reduce((sum, a) => sum + (a.co2 || 0), 0),
      saved: 25.4
    };
    */

    res.render("users/profile", {
      title: "My Profile",
      user,
      // activities,
      // totals,
      currentUser: req.session.user,
      pageCSS: ["profile"]
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading profile");
    res.redirect("/");
  }
});


// 🔧 Update Profile
router.post("/profile", isLoggedIn, async (req, res) => {
  try {
    const { name, location } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, {
      name,
      location
    });

    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");

  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating profile");
    res.redirect("/profile");
  }
});


// ℹ Static pages
router.get("/About", (req, res) => {
  res.render("About", {
    title: "About Us",
    pageCSS: ["About"],
    currentUser: req.session.user
  });
});

router.get("/faq", (req, res) => {
  res.render("faq", {
    title: "Frequently Asked Questions | Equil",
    pageCSS: ["faq"],
    currentUser: req.session.user
  });
});

router.get("/help", (req, res) => {
  res.render("help", {
    title: "Help and Support",
    pageCSS: ["help"],
    currentUser: req.session.user
  });
});


module.exports = router;
