const prisma = require("../../config/databaseConnection");

// the sweep: find expired pending bookings, free their seats
async function sweepExpiredBookings() {
  try {
    const expired = await prisma.booking.findMany({
      where: { status: "pending", expires_at: { lt: new Date() } },
    });
    for (const b of expired) {
      await prisma.$transaction([
        prisma.bookingSeat.deleteMany({ where: { booking_id: b.booking_id } }),
        prisma.booking.update({
          where: { booking_id: b.booking_id },
          data: { status: "expired" },
        }),
      ]);
    }
  } catch (err) {
    console.error("expiry sweep failed:", err.message);
  }
}

function startExpiryJob(intervalMs = 30000) {
  setInterval(sweepExpiredBookings, intervalMs);
}

module.exports = { startExpiryJob, sweepExpiredBookings };
