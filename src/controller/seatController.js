const { paginationSchema } = require("../schemas/seatSchema");
const { createSeat, getSeat } = require("../services/seatServices");

exports.addSeat = async (req, res) => {
  try {
    const seat = await createSeat(req.body);
    res.status(201).json({ status: "success", data: seat });
  } catch (error) {
    // honor a 404 the service raised; default to 500 otherwise
    const status = error.statusCode || 500;
    return res.status(status).json({ status: "error", message: error.message });
  }
};

exports.listSeats = async (req, res) => {
  try {
    const { page, limit, sort, order, theater_id, categoryID, q } =
      paginationSchema.parse(req.query);

    const getSeats = await getSeat(
      page,
      limit,
      sort,
      order,
      theater_id,
      categoryID,
      q,
    );
    return res.status(200).json({ status: "success", data: getSeats });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
