const prisma = require("../../config/databaseConnection");

exports.createSeat = async (seatPayload) => {
  try {
    // Referential validation: Zod already checked theater_id/categoryID are
    // positive ints (format). Here we confirm those rows actually EXIST (the
    // check Zod can't do — it needs the DB). Throw a clear error the controller
    // maps to 404.
    const theater = await prisma.theater.findUnique({
      where: { theater_id: seatPayload.theater_id },
    });
    if (!theater) {
      const err = new Error("Theater not found");
      err.statusCode = 404;
      throw err;
    }

    const category = await prisma.category.findUnique({
      where: { categoryID: seatPayload.categoryID },
    });
    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    return await prisma.seat.create({
      data: {
        seatNumber: seatPayload.seatNumber,
        theater_id: seatPayload.theater_id,
        categoryID: seatPayload.categoryID,
      },
    });
  } catch (error) {
    // preserve a known 404; otherwise wrap as a generic DB error
    if (error.statusCode) throw error;
    throw new Error(`Database error while creating seat: ${error.message}`);
  }
};

exports.getSeat = async (
  page,
  limit,
  sort,
  order,
  theater_id,
  categoryID,
  q,
) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (theater_id) where.theater_id = theater_id;
  if (categoryID) where.categoryID = categoryID;
  if (q) where.seatNumber = { contains: q, mode: "insensitive" };

  const seats = await prisma.seat.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sort]: order },
  });

  const total = await prisma.seat.count({ where });

  return {
    data: seats,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
