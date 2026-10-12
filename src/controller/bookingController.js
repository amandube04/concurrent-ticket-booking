const bookingService = require("../services/bookSeatService");

exports.bookingSeat = async (req, res) => {
  try {
    const userId = req.user.userId;

    const booking = await bookingService.bookAvailableSeat(req.body, userId);
    res.status(201).json({ status: "success", data: booking });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ status: "error", message: error.message });
  }
};
