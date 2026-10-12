const prisma = require("../../config/databaseConnection");

exports.insertCategories = async (categoryPayload) => {
  try {
    return await prisma.category.create({
      data: {
        categoryType: categoryPayload.categoryType,
        price_modifier: categoryPayload.price_modifier,
      },
    });
  } catch (error) {
    throw new Error(
      `Database error while inserting categories: ${error.message}`,
    );
  }
};
