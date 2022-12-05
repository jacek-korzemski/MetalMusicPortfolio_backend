const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  videoId: {
    type: Number,
    required: [true, "ID is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  rating: {
    type: Number,
    required: [false],
  },
});

module.exports =
  mongoose.model.Reviews || mongoose.model("Reviews", ReviewSchema);
