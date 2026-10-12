const prisma = require("../../config/databaseConnection");
const redisClient = require("../../config/redisClient");

const eventCacheKey = "event:all";

exports.createEvent = async (eventPayload) => {
  try {
    const eventCreated = await prisma.event.create({
      data: {
        eventName: eventPayload.eventName,
        eventType: eventPayload.eventType,
        eventDate: eventPayload.eventDate,
      },
    });
    await redisClient.del(eventCacheKey);
    return eventCreated;
  } catch (error) {
    throw new Error(
      `Database error while adding event details: ${error.message}`,
    );
  }
};

exports.getEvent = async () => {
  try {
    const cached = await redisClient.get(eventCacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error("cache read failed, using DB:", err.message);
  }

  let events;
  try {
    events = await prisma.event.findMany();
  } catch (error) {
    throw new Error(
      `Database error while adding event details: ${error.message}`,
    );
  }

  try {
    await redisClient.set(eventCacheKey, JSON.stringify(events), { EX: 60 });
  } catch (err) {
    console.error("cache write failed:", err.message);
  }

  return events;
};
