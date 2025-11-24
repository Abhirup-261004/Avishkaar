const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    // Email is the unique login field
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Optional display username (not used for login)
    username: {
      type: String,
      trim: true,
      default: function () {
        if (this.email) return this.email.split("@")[0];
        return "User_" + Math.floor(Math.random() * 10000);
      },
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
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: true,
});

module.exports = mongoose.model("User", userSchema);
