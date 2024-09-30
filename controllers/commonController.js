const { Service, LostAndFound } = require("../models");

const commonController = {
  getServices: async (req, res) => {
    try {
      const services = await Service.find();
      res.status(200).json({ services });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getLostAndFound: async (req, res) => {
    try {
      const role = req.params.role;
      const lostAndFound = await LostAndFound.find();
      res.status(200).json({ lostAndFound });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },
};

module.exports = commonController;
