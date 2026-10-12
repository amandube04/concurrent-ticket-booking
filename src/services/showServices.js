const prisma = require("../../config/databaseConnection");

exports.createShow = async (showPayload) => {
  try {
    // FK existence checks — a show links an existing event to an existing theater
    const event = await prisma.event.findUnique({
      where: { eventID: showPayload.eventID },
    });
    if (!event) {
      const err = new Error("Event not found");
      err.statusCode = 404;
      throw err;
    }

    const theater = await prisma.theater.findUnique({
      where: { theater_id: showPayload.theater_id },
    });
    if (!theater) {
      const err = new Error("Theater not found");
      err.statusCode = 404;
      throw err;
    }

    return await prisma.show.create({
      data: {
        eventID: showPayload.eventID,
        theater_id: showPayload.theater_id,
        showTime: showPayload.showTime,
        base_price: showPayload.base_price,
      },
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Database error while creating show: ${error.message}`);
  }
};
