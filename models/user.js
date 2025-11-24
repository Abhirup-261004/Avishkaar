const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      required: false,
    },

    name: { type: String, default: "" },
    location: { type: String, default: "" },
    badgesEarned: { type: Number, default: 0 },
    age: { type: Number, default: 20 },
    state: { type: String, default: "West Bengal" },
  },
  { timestamps: true }
);

// ⭐ VERY IMPORTANT — attach plugin cleanly
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("User", userSchema);
