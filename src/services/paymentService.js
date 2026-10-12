const prisma = require("../../config/databaseConnection");

exports.handlePayment = async (bookingPayload, userId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        booking_id: bookingPayload.booking_id,
      },
      include: { Show: true },
    });

    if (!booking) {
      const e = new Error("Booking not found");
      e.statusCode = 404;
      throw e;
    }

    if (booking.user_id !== userId) {
      const e = new Error("You cannot pay for another user's booking");
      e.statusCode = 403;
      throw e;
    }

    if (booking.status === "confirmed") {
      return {
        message: "Your Booking id is something I will display here",
        data: booking.booking_id,
      };
    }
    if (booking.status === "cancelled" || booking.status === "expired") {
      const e = new Error("Booking is cancelled or expired");
      e.statusCode = 409;
      throw e;
    }

    const amount = booking.Show.base_price;

    const fakePay = (amount) => {
      return { success: true };
    };

    const result = fakePay(amount);

    if (!result.success) {
      const e = new Error("Payment failed");
      e.statusCode = 402;
      throw e;
    }
    // Question is do we need another table or somehow to manage taxes?

    return await prisma.$transaction(async (tx) => {
      const paymentRecord = await tx.payment.create({
        data: {
          booking_id: bookingPayload.booking_id,
          amount,
          paymentType: bookingPayload.paymentType,
          payment_status: result.success ? "success" : "failed",
        },
      });

      const updatebooking = await tx.booking.update({
        where: {
          booking_id: bookingPayload.booking_id,
        },
        data: {
          status: "confirmed",
        },
      });
      return updatebooking;
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Database error while booking: ${error.message}`);
  }
};
