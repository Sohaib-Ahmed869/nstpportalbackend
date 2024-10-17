const {Blog} = require('../models');

const commonController = {
  getBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find().lean();
      return res.status(200).json({ blogs });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = commonController;