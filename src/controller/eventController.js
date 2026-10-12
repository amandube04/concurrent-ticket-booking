const { createEvent, getEvent } = require("../services/eventServices");

exports.registerEvent = async (req, res) => {
  try {
    const addEvent = await createEvent(req.body);
    res.status(201).json({ status: "success", data: addEvent });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.fetchEvents = async (req, res) => {
  try {
    const fetchEvent = await getEvent();
    res.status(200).json({ status: "success", data: fetchEvent });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
