const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["client", "freelancer"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
    },
    profile: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
      },
      avatar: String,
      bio: String,
      location: String,
      phone: String,
    },
    // Freelancer-specific fields
    freelancerProfile: {
      skills: [String],
      hourlyRate: Number,
      portfolio: [
        {
          title: String,
          description: String,
          url: String,
          image: String,
        },
      ],
      experience: String,
      rating: {
        type: Number,
        default: 0,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
    },
    // Client-specific fields
    clientProfile: {
      companyName: String,
      industry: String,
      postedJobs: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    // Throw so Mongoose handles the error for async middleware
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
