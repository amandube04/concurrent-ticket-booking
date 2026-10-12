const prisma = require("../../config/databaseConnection");

exports.addTheaterList = async (theaterDetails) => {
  try {
    return await prisma.theater.create({
      data: {
        theater_name: theaterDetails.theater_name,
        address: theaterDetails.address,

        Theater_availability: {
          create: theaterDetails.theater_availability,
        },
      },
      include: {
        Theater_availability: true,
      },
    });
  } catch (error) {
    throw new Error(`Database error while adding theater: ${error.message}`);
  }
};
