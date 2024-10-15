const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    caption: {
      type: String,
    },
    image_index: {
      type: Number,
    },
    paragraphs: {
      type: [String],
      required: true,
    },
    date_published: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
