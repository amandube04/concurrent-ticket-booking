const { createShow } = require("../services/showServices");

exports.addShow = async (req, res) => {
  try {
    const show = await createShow(req.body);
    res.status(201).json({ status: "success", data: show });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ status: "error", message: error.message });
  }
};
