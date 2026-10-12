require("dotenv").config();
const prisma = require("./config/databaseConnection");
const express = require("express");
const authRouter = require("./src/router/authRouter");
const theaterRouter = require("./src/router/theaterRouter");
const eventRouter = require("./src/router/eventRouter");
const categoryRouter = require("./src/router/categoryRouter");
const seatRouter = require("./src/router/seatRouter");
const showRouter = require("./src/router/showRouter");
const bookingRouter = require("./src/router/bookingRouter");
const paymentRouter = require("./src/router/paymentRouter");
const { startExpiryJob } = require("./src/jobs/expireBookings");

const PORT = 3000;
const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/theater", theaterRouter);
app.use("/api/event", eventRouter);
app.use("/api", categoryRouter);
app.use("/api/seat", seatRouter);
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/payment", paymentRouter);

const startServer = async () => {
  try {
    app.listen(PORT, () => console.log("Server started at: ", PORT));
    startExpiryJob();
  } catch (error) {
    console.error("Boot Error", error);
    process.exit(1);
  }
};

startServer();
