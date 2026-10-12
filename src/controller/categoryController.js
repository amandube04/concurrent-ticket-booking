const { insertCategories } = require("../services/categoryServices");

exports.seatCategory = async (req, res) => {
  try {
    const handleCategory = await insertCategories(req.body);

    res.status(201).json({ status: "success", data: handleCategory });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
