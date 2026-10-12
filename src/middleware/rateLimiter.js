const userAttempts = new Map();

const checkUserAttempt = (req, res, next) => {
  const userIp = req.ip;
  const currentTime = Date.now();
  const SHORT_WINDOW = 1 * 60 * 1000;
  const COOL_DOWN = 5 * 60 * 1000;
  const WINDOW_DURATION = 1 * 60 * 1000;
  const MAX_ATTEMPTS = 5;
  if (userAttempts.has(userIp)) {
    const session = userAttempts.get(userIp);

    if (session.isBlocked) {
      if (currentTime > session.expirationTime) {
        session.isBlocked = false;
        session.count = 1;
        session.expirationTime = currentTime + SHORT_WINDOW;
        userAttempts.set(userIp, session);
        return next();
      } else {
        const timeLeft = Math.ceil(
          (session.expirationTime - currentTime) / 1000,
        );
        return res.status(429).json({
          message: `Too many tries. Please try again after ${Math.ceil(timeLeft / 60)} minutes.`,
        });
      }
    }

    // its to re-set timmer after 1 minute passed
    if (currentTime > session.expirationTime) {
      session.count = 1;
      session.expirationTime = currentTime + SHORT_WINDOW;
      userAttempts.set(userIp, session);
      return next();
    }

    session.count++;
    // check for condition if it met will throw an error
    if (session.count > MAX_ATTEMPTS) {
      session.isBlocked = true;
      session.expirationTime = currentTime + COOL_DOWN;
      userAttempts.set(userIp, session);
      return res.status(429).json({
        message: "Too many tries. Please try again after 5 minute.",
      });
    }

    userAttempts.set(userIp, session);
    return next();
  } else {
    userAttempts.set(userIp, {
      count: 1,
      isBlocked: false,
      expirationTime: currentTime + WINDOW_DURATION,
    });
    return next();
  }
};

module.exports = checkUserAttempt;
