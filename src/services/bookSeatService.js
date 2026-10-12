const prisma = require("../../config/databaseConnection");

exports.bookAvailableSeat = async (bookPayload, userID) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const showExist = await tx.show.findUnique({
        where: {
          show_id: bookPayload.show_id,
        },
      });
      if (!showExist) {
        throw new Error("The requested show or event does not exist.");
      }

      const checkBookingExist = await tx.booking.findUnique({
        where: { idempotency_key: bookPayload.idempotency_key },
      });
      if (checkBookingExist) {
        return checkBookingExist;
      }

      const booking = await tx.booking.create({
        data: {
          user_id: userID,
          show_id: showExist.show_id,
          status: "pending",
          idempotency_key: bookPayload.idempotency_key,
          expires_at: new Date(Date.now() + 60 * 1000),
          BookingSeat: {
            create: bookPayload.seat_ids.map((id) => ({
              seat_id: id,
              show_id: showExist.show_id,
            })),
          },
        },
      });

      return { booking };
    });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("Seat is already booked for this show");
      err.statusCode = 409;
      throw err;
    }
    if (error.statusCode) throw error;
    throw new Error(`Database error while booking: ${error.message}`);
  }
};
