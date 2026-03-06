const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  media: [
    {
      type: String
    }
  ],

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: [
      "Road Damage",
      "Garbage Issue",
      "Water Supply",
      "Electricity",
      "Drainage Problem",
      "Public Property Damage",
      "Other"
    ],
    required: true
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  address: {
    type: String
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },

  completionProof: {
    type: String
  }

}, { timestamps: true });

reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", reportSchema);