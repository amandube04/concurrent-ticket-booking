const { handlePayment } = require("../services/paymentService");

exports.processPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymetConfirmation = await handlePayment(req.body, userId);

    res
      .status(200)
      .json({ message: "Payment successfull", data: paymetConfirmation });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ status: "error", message: error.message });
  }
};
