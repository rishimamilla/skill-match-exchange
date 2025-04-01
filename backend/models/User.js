const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: "default-avatar.png",
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot be more than 500 characters"],
    default: "",
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
  },
  location: {
    type: String,
    required: [true, "Please add a location"],
  },
  skills: [{
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["teaching", "learning"],
      required: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    }
  }],
  interests: [String],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    icon: String,
  }],
  endorsements: [{
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
    endorser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  totalExchanges: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocuments: [{
    type: String,
  }],
  numReviews: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
