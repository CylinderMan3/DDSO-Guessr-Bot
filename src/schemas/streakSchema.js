// models/User.js
const mongoose = require("mongoose");

const streakSchema = new mongoose.Schema({
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  extreme: { type: Number, default: 0 },
});

const correctCounterSchema = new mongoose.Schema({
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  extreme: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  streak: { type: streakSchema, default: () => ({}) },
  correctCounter: { type: correctCounterSchema, default: () => ({}) },
});

module.exports = mongoose.model("AstroGuesserStreakSchema", userSchema);
