const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: String,
    lastName: String,
    email: { type: String, unique: true, sparse: true },
    mobile: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    password: String,
    addresses: [
      {
        label: String,
        fullName: String,
        mobile: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    googleId: String,
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
