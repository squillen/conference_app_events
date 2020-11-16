const EventsDAO = require('../../db/dao/eventsDAO')
const { getLocationDetails, sendEventNotification } = require('../utils/requests')

class Event {
  constructor ({ attendanceCost, name, locationID, sponsors, vendors } = {}) {
    this.name = name
    this.locationID = locationID
    this.sponsors = sponsors
    this.attendanceCost = attendanceCost
    this.vendors = vendors
  }

  toJson () {
    return {
      name: this.name,
      location: this.location,
      sponsors: this.sponsors,
      attendanceCost: this.attendanceCost,
      vendors: this.vendors,
    }
  }
}

async function calculateExpectedRevenue (event) {
  const { attendanceCost = 0, vendors = {} } = event
  let locationDetails = {}
  let maxRoomsOccupancy = 0
  let freeBadges = 0
  let expectedRevenue = 0

  // get location details to determine max occupancy
  try {
    locationDetails = await getLocationDetails(event.locationID)
    if (!locationDetails) return { error: 'No location found with that ID' }

    maxRoomsOccupancy = locationDetails.rooms.reduce((num, room) => {
      return num + Number(room.maximumOccupancyNum)
    }, 0)
  } catch (e) {
    console.error(e)
  }

  // handle sponsors
  if (event.sponsors) {
    event.sponsors.forEach(sponsor => {
      freeBadges += Number(sponsor.freeBadges)
      expectedRevenue += Number(sponsor.cost)
    })
  }

  // handle vendors
  freeBadges += (Number(vendors.availableBooths) * 2) // two free tickets per booth
  expectedRevenue += (vendors.availableBooths * vendors.boothCost)

  // handle general admission
  const generalAdmission = Number(maxRoomsOccupancy) - freeBadges
  expectedRevenue += generalAdmission * attendanceCost

  if (expectedRevenue < 0) {
    return { error: 'The event as configured is not expected to make any money! Retool your pricing.' }
  }

  return { expectedRevenue }
}

async function validateInput (event) {
  const { locationID, name, sponsors } = event
  const errors = {}

  // NAME CHECKS
  if (!name) errors.missingName = 'Events must have a name'
  else {
    // confirm event does not already exist
    try {
      const eventAlreadyExists = await EventsDAO.findEventByName(name)
      if (eventAlreadyExists) errors.duplicateEvent = 'An event by that name already exists'
    } catch (e) {
      console.error(e)
    }
  }

  // LOCATION CHECKS
  if (!locationID) errors.missingLocationID = 'Events must have a location ID'
  else {
    try {
      const locationDetails = await getLocationDetails(locationID)
      if (!locationDetails) {
        errors.wrongLocationID = 'There is no location with that ID. Please review and try again.'
      }
    } catch (e) {
      console.error(e)
    }
  }

  // SPONSORS CHECKS
  if (sponsors) {
    const sponsorsCheck = {}
    sponsors.forEach(sponsor => {
      if (sponsorsCheck[sponsor.name]) errors.duplicateSponsors = 'Your sponsors list has duplicate sponsor types'
      sponsorsCheck[sponsor.name] = sponsor.name
    })
  }

  // REVENUE CHECK
  const { error } = await calculateExpectedRevenue(event)
  if (error) errors.expectedRevenue = error

  return { errors }
}

module.exports = class EventController {
  static async createNewEvent (req, res) {
    try {
      const { name } = req.body

      // check input for errors
      const { errors } = await validateInput(req.body)
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      // passed all tests, make into event
      const eventInfo = { ...req.body }

      const insertResult = await EventsDAO.createNewEvent(eventInfo)
      if (insertResult.error) errors.creationError = insertResult.error

      const savedEvent = await EventsDAO.findEventByName(name)
      if (!savedEvent) errors.general = 'Internal error, please try again later'

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }
      return res.json({ ...savedEvent })
    } catch (e) {
      res.status(500).json({ error: e })
    }
  }

  static async findEventByID (req, res) {
    try {
      const { id } = req.body
      const event = await EventsDAO.findEventByID(id)
      if (event.name) return res.json({ success: event })
      res.json({ error: 'unable to find event' })
    } catch (error) {
      console.error('findEventByID error ::: ', error)
      res.json({ error })
    }
  }

  static async findEventByName (req, res) {
    try {
      const { name } = req.body
      const event = await EventsDAO.findEventByName(name)
      if (event.name) return res.json({ success: event })
      res.json({ error: 'unable to find event' })
    } catch (error) {
      console.error('findEventByName error ::: ', error)
      res.json({ error })
    }
  }

  static async findNearestEvents (req, res) {
    try {
      const { location = {} } = req.body
      const response = await EventsDAO.findNearestEvents(location)
      return res.json({ success: response })
    } catch (error) {
      console.error('findEventByID error ::: ', error)
      res.json({ error })
    }
  }

  static async findAndUpdateEvent (req, res) {
    try {
      const { name, update } = req.body
      const updatedEvent = await EventsDAO.findAndUpdateEvent(name, update)
      sendEventNotification(updatedEvent, 'eventUpdated')
      return res.json({ success: updatedEvent })
    } catch (error) {
      console.error('findAndUpdateEvent error ::: ', error)
      return res.json({ error })
    }
  }

  static async updateEventSponsors (req, res) {
    try {
      const { name, sponsors } = req.body
      const updatedEvent = await EventsDAO.updateEventSponsors(name, sponsors)
      return res.json({ success: updatedEvent })
    } catch (error) {
      console.error('findAndUpdateEvent error ::: ', error)
      return res.json({ error })
    }
  }

  static async findExpectedEventRevenue (req, res) {
    try {
      const { name } = req.body
      const event = await EventsDAO.findEventByName(name)
      // calculate event details...or should this already be a precalculated field?
      return res.json({ success: event })
    } catch (error) {
      console.error('findExpectedEventRevenue error ::: ', error)
      return res.json({ error })
    }
  }
}
