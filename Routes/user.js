const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware/auth");


// 🌍 Home Page
router.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    pageCSS: ["home"], // ✅ will load /public/css/home.css
    currentUser: req.user
  });
});

// 🧾 Register form
router.get("/register", (req, res) => {
  res.render("users/register", {
    title : "Sign Up ", 
    pageCSS : ["auth"], 
     currentUser: req.user,
   
  
  });
});

// 🧾 Register user
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // 1. Check if email already exists
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        req.flash("error", "Email already registered!");
        return res.redirect("/register");
      }

      // 2. Create user document (NO password here)
      const user = new User({ username, email });

      // 3. Use passport-local-mongoose register with CALLBACK
      User.register(user, password, (err, registeredUser) => {
        if (err) {
          console.log("REGISTRATION ERROR:", err);
          req.flash("error", "Registration failed. Try again.");
          return res.redirect("/register");
        }

        req.flash("success", "Registration successful. Please log in!");
        res.redirect("/login");
      });
    })
    .catch((err) => {
      console.log("REGISTER FIND ERROR:", err);
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect("/register");
    });
});


// 🔐 Login form
router.get("/login", (req, res) => {
  res.render("users/login", {
    title: " Sign In ",
    pageCSS: ["auth"], // ✅ loads auth.css
   
    currentUser: req.user
  });
});

// 🔐 Login user
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/"); // Redirect to dashboard after login
  }
);

// 🚪 Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/login");
  });
});

// Show profile page
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const activities = await Activity.find({ user: req.user._id });

    const totals = {
      emitted: activities.reduce((sum, a) => sum + (a.co2 || 0), 0),
      saved: 25.4 // (temporary static value)
    };

    res.render("users/profile", {
      title: "My Profile ",
      user,                    // ✅ this is the key part
      totals,
      activities,
      currentUser: req.user,
      pageCSS: ["profile"],
      bodyClass: "profile-page",
     
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading profile");
    res.redirect("/dashboard");
  }
});

router.post("/profile", isLoggedIn, async (req, res) => {
  try {
    const { name, location } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      name,
      location,
    });

    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating profile");
    res.redirect("/profile");
  }
});
router.get('/About', (req, res) => {
  res.render('About', {
    title: 'About Us',
    pageCSS: ['About'],
    currentUser: req.user
  });
});


module.exports = router;