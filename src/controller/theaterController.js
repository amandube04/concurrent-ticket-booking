const { addTheaterList } = require("../services/theaterRegisterServices");

require("dotenv").config();

exports.addTheater = async (req, res) => {
  try {
    const addNewTheater = await addTheaterList(req.body);

    return res.status(201).json({ status: "success", data: addNewTheater });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
