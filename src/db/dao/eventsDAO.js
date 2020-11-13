const ObjectId = require('mongodb').ObjectId;
let events;

module.exports = class EventsDAO {
  static async injectDB(conn) {
    if (events) return;
    try {
      const dbName = process.env.DB_NAME || 'development';
      events = await conn.db(dbName).collection('events');
      events.createIndex({ eventDate: 1 });
      console.info('EventsDAO connected');
    } catch (e) {
      console.error(`Unable to establish collection connections in EventsDAO: ${e}`);
    }
  }

  static async createNewEvent(info) {
    try {
      return await events.insertOne(info, { writeConcern: 2 });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async findAndUpdateEvent(name, update) {
    try {
      return await events.updateOne(
        { name },
        update,
      );
    } catch (e) {
      console.error('Error in findAndUpdateEvent()', e);
      return null;
    }
  }

  static async findEventByID(id) {
    const _id = ObjectId(id);
    try {
      return await events.findOne({ _id });
    } catch (e) {
      console.error('Error in findEventByID :::', e);
      return null;
    }
  }

  static async findEventByName(name) {
    try {
      return await events.findOne({ name });
    } catch (e) {
      console.error('Error in findEventByName :::', e);
      return null;
    }
  }

  static async findNearestEvents(location = '') {
    try {
      const query = { }
      const cursor = await events.find(query);
      return await cursor.toArray();
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
