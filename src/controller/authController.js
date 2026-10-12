require("dotenv").config();
const bcrypt = require("bcrypt");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utils/tokenGenerator");
const userAttemptLogin = require("../../utils/loginAttempts");
const { cookieSetting } = require("../../utils/headersFile");
const {
  checkUserExist,
  create,
  signIn,
  checkUserExistWithID,
  signOut,
} = require("../services/userAccessServices");

exports.signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // check if exist
    const unqiueEmail = await checkUserExist(email);

    if (unqiueEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await create(email, username, hashedPassword);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await checkUserExist(email);

    console.log("User Exist: ", userExist);

    if (!userExist || !(await bcrypt.compare(password, userExist.password))) {
      userAttemptLogin.recordFailure(email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken(userExist.user_id, userExist.role);
    const refreshToken = createRefreshToken(userExist.user_id);

    await signIn(userExist.user_id, refreshToken);

    cookieSetting(res, refreshToken);
    userAttemptLogin.clearAttempts(email);

    res.status(200).json({
      message: "User is logged!",
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const clientRefreshToken = match ? match[1] : null;

    if (!clientRefreshToken) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Refresh Token" });
    }

    const verified = verifyRefreshToken(clientRefreshToken);

    const user = await checkUserExistWithID(verified.userId);

    if (!user || user.refresh_token !== clientRefreshToken) {
      return res.status(403).json({ message: "token is invalid or revoked" });
    }

    const newAccessToken = createAccessToken(user.user_id, user.role);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signOut = async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const clientRefreshToken = match ? match[1] : null;

    if (!clientRefreshToken) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Refresh Token" });
    }

    const verified = verifyRefreshToken(clientRefreshToken);

    res.clearCookie("refreshToken");
    await signOut(verified.userId);

    res.status(200).json({
      message: "User Logged Out",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
