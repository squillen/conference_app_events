const EventsDAO = require('../../db/dao/eventsDAO');

class Event {
  constructor({ name, location, sponsors } = {}) {
    this.name = name;
    this.location = location;
    this.sponsors = sponsors;
  }

  toJson() {
    return { name: this.name, sponsors: this.sponsors };
  }
}

module.exports = class EventController {
  static async createNewEvent(req, res) {
    try {
      const { name, location } = req.body;
      const errors = {};

      if (!location) errors.missingLocation = 'Events must have a location';
      if (!name) errors.missingName = 'Events must have a name';

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const eventAlreadyExists = await EventsDAO.findEventByName(name);
      if (eventAlreadyExists) {
        errors.duplicate = 'Event already exists';
        res.status(400).json(errors);
        return;
      }

      const eventInfo = { ...req.body };

      const insertResult = await EventsDAO.createNewEvent(eventInfo);
      if (!insertResult.success) errors.creationError = insertResult.error;

      const savedEvent = await EventsDAO.findEventByName(name);
      if (!savedEvent) errors.general = 'Internal error, please try again later';

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const event = new Event(savedEvent);
      return res.json({ success: { event: event.toJson() } });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }

  static async findEventByID(req, res) {
    try {
      const { id } = req.body;
      const event = await EventsDAO.findEventByID(id);
      if (event.name) return res.json({ success: event })
      res.json({ error: 'unable to find event' });
    } catch (error) {
      console.error('findEventByID error ::: ', error);
      res.json({ error });
    }
  }

  static async findEventByName(req, res) {
    try {
      const { name } = req.body;
      const event = await EventsDAO.findEventByName(name);
      if (event.name) return res.json({ success: event })
      res.json({ error: 'unable to find event' });
    } catch (error) {
      console.error('findEventByName error ::: ', error);
      res.json({ error });
    }
  }

  static async findNearestEvents(req, res) {
    try {
      const { location } = req.body;
      const response = await EventsDAO.findNearestEvents(location);
      return res.json({ success: response });
    } catch (error) {
      console.error('findEventByID error ::: ', error);
      res.json({ error });
    }
  }

  static async findAndUpdateEvent(req, res) {
    try {
      const { name, update } = req.body;
      const updatedEvent = await EventsDAO.findAndUpdateEvent(name, update);
      return res.json({ success: updatedEvent });
    } catch (error) {
      console.error('findAndUpdateEvent error ::: ', error);
      return res.json({ error });
    }
  }
};
