const store = new Map();

const getOrCreateSession = (email) => {
  if (!store.has(email)) {
    store.set(email, {
      count: 0,
      isBlocked: false,
      expirationTime: 0,
    });
  }
  return store.get(email);
};

exports.isLocked = (email) => {
  if (!email) return false;
  const session = store.get(email);
  if (!session) return false;
  const currentTime = Date.now();

  if (session.isBlocked) {
    if (currentTime > session.expirationTime) {
      session.isBlocked = false;
      session.count = 0;
      session.expirationTime = 0;
      store.set(email, session);
      return false;
    }
    return true;
  }
  return false;
};

exports.recordFailure = (email) => {
  if (!email) return;

  const session = getOrCreateSession(email);
  const COOL_DOWN = 5 * 60 * 1000;

  session.count++;

  if (session.count > 5) {
    session.isBlocked = true;
    session.expirationTime = Date.now() + COOL_DOWN;
  }

  store.set(email, session);
};

exports.clearAttempts = (email) => {
  if (!email) return;
  store.delete(email);
};
