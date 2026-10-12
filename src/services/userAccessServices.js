const prisma = require("../../config/databaseConnection");

exports.checkUserExist = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new Error(`Database error checking user: ${error.message}`);
  }
};

exports.checkUserExistWithID = async (id) => {
  try {
    return await prisma.user.findUnique({
      where: { user_id: id },
    });
  } catch (error) {
    throw new Error(`Database error checking user: ${error.message}`);
  }
};

exports.create = async (email, username, password) => {
  try {
    return await prisma.user.create({
      data: { email, username, password: password },
    });
  } catch (error) {
    throw new Error(`Database error creating user: ${error.message}`);
  }
};

exports.signIn = async (userid, refreshToken) => {
  try {
    return await prisma.user.update({
      where: { user_id: userid },
      data: { refresh_token: refreshToken },
    });
  } catch (error) {
    throw new Error(`Database error creating user: ${error.message}`);
  }
};

exports.signOut = async (userid) => {
  try {
    return await prisma.user.update({
      where: { user_id: userid },
      data: { refresh_token: "" },
    });
  } catch (error) {
    throw new Error(`Database error creating user: ${error.message}`);
  }
};
