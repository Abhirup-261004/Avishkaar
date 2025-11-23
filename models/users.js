const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      default: function () {
        if (this.email) return this.email.split("@")[0];
        return "User_" + Math.floor(Math.random() * 10000);
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    badgesEarned: {
      type: Number,
      default: 0,
    },
    age: { type: Number, default: 20 },
    state: { type: String, default: "West Bengal" },
    // lifestyle: { type: String, default: "student-home" },

    // badges: { type: [badgeSchema], default: [] },
    // points: { type: Number, default: 0 },
    // streak: {
    //   current: { type: Number, default: 0 },
    //   lastActivityAt: { type: Date, default: null }
    // },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// Ensure username always exists before saving
userSchema.pre("save", function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  } else if (!this.username) {
    this.username = "User_" + Math.floor(Math.random() * 10000);
  }
  next();
});


// Passport plugin for authentication
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);