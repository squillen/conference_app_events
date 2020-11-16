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

function formatEventDate (date = '') {
  const [month, day, year] = date.split('/')
  let dateYear = year
  if (year && year.length === 2) dateYear = `20${year}`
  return new Date(dateYear, month - 1, day)
}

async function calculateExpectedRevenue (event = {}) {
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
  const generalAttendance = Number(maxRoomsOccupancy) - freeBadges

  if (generalAttendance < 0 && generalAttendance !== 0) {
    const error = `
    This location can only allow for ${maxRoomsOccupancy} maximum occupants and you are currently
    giving away ${freeBadges} free badges, thus there is no more room for general admissions.
    Please reconfigure
  `
    return { error }
  }
  expectedRevenue += generalAttendance * attendanceCost

  if (expectedRevenue < 0) {
    return { error: 'The event as configured is not expected to make any money! Retool your pricing.' }
  }

  return { expectedRevenue, generalAttendance }
}

async function validateInput (event, updating) {
  const {
    eventDate = '',
    locationID = '',
    name = '',
    sponsors = [],
    presentations = {},
    vendors = {},
  } = event
  const errors = {}

  // NAME CHECKS
  if (!name) errors.missingName = 'Events must have a name'
  else {
    if (!updating) {
      // confirm event does not already exist
      try {
        const eventAlreadyExists = await EventsDAO.findEventByName(name)
        if (eventAlreadyExists) errors.duplicateEvent = 'An event by that name already exists'
      } catch (e) {
        console.error(e)
      }
    }
  }

  // LOCATION CHECKS
  if (!locationID) errors.missingLocationID = 'Events must have a locationID'
  else {
    try {
      const locationDetails = await getLocationDetails(locationID)
      if (!locationDetails) {
        errors.wrongLocationID = 'There is no location with that ID. Please review and try again.'
      } else {
        if (vendors) {
          const totalAllowedVendors = locationDetails.mezzanineAreas.reduce((total, area) => {
            return area.maxNumPossibleBoothSpaces + total
          }, 0)
          if (vendors.availableBooths > totalAllowedVendors) {
            errors.vendorError = `This location only allows for ${totalAllowedVendors} total vendors. Please reduce the number of vendors.`
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // SPONSORS CHECKS
  if (sponsors) {
    const error = checkSponsorValidity(sponsors)
    if (error) errors.duplicateSponsors = error
  }

  // PRESENTATIONS CHECK
  if (presentations) {
    if (!presentations.maxPresentations) errors.missingPresentationMax = 'You must include a number of maxPresentations'
    if (!presentations.presentationLength) errors.missingPresentationLength = 'You must include an expected presentationLength'
  } else errors.missingPresentations = "Please include a 'presentations' object containing the maxPresentations and expected presentationLength"

  // REVENUE CHECK
  const { error, generalAttendance } = await calculateExpectedRevenue(event)
  if (error) errors.expectedRevenue = error

  // DATE CHECKS
  const eventDateString = eventDate.toString()
  console.log("eventDateString.toString().split('T').length :>> ", eventDateString.toString().split('T').length);
  if (!eventDateString) errors.missingEventDate = 'Events must have a date in the format MM/DD/YYYY'
  else if (eventDateString && eventDateString.split('T') && eventDateString.toString().split('T').length < 2) {
    const year = eventDateString.split('/')[2]
    if (!year) errors.wrongDateFormat = 'Event dates must be formatted like MM/DD/YYYY'
    else {
      const formattedDate = formatEventDate(eventDateString)
      const dateIsInThePast = formattedDate < new Date()
      if (dateIsInThePast) errors.eventDateError = 'Event date must be in the future'
    }
  }

  return { errors, generalAttendance }
}

function checkSponsorValidity (sponsors) {
  if (!Array.isArray(sponsors)) return 'Sponsors must be an array of objects'
  const sponsorsCheck = {}
  for (let i = 0; i < sponsors.length; i++) {
    const sponsor = sponsors[i]
    if (sponsorsCheck[sponsor.name]) return 'Your sponsors list has duplicate sponsor types'
    sponsorsCheck[sponsor.name] = sponsor.name
  }
  return false
}

module.exports = class EventController {
  static async createNewEvent (req, res) {
    try {
      const { name } = req.body

      // check input for errors
      const { errors, generalAttendance } = await validateInput(req.body)
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      // passed all tests, make into event
      const eventDate = formatEventDate(req.body.eventDate)
      const eventInfo = { ...req.body, eventDate, generalAttendance }

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
      const response = await EventsDAO.findNearestEvents()
      return res.json({ events: response })
    } catch (error) {
      console.error('findEventByID error ::: ', error)
      res.json({ error })
    }
  }

  static async findAndUpdateEvent (req, res) {
    try {
      const { id } = req.params
      const { update } = req.body
      const currentEvent = await EventsDAO.findEventByID(id)
      const checkEvent = { ...currentEvent, ...update }
      const { errors, generalAttendance } = await validateInput(checkEvent, true)
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      // passed all tests, make into event
      if (update.eventDate) {
        const eventDate = formatEventDate(update.eventDate)
        update.eventDate = eventDate
      }
      await EventsDAO.findAndUpdateEvent(id, { ...update, generalAttendance })
      const event = await EventsDAO.findEventByID(id)
      sendEventNotification(event, 'eventUpdated')
      return res.json({ success: event })
    } catch (error) {
      console.error('findAndUpdateEvent error ::: ', error)
      return res.json({ error })
    }
  }

  static async updateEventSponsors (req, res) {
    try {
      const { name, sponsors } = req.body

      // PERFORM DATA CHECKS
      const errors = {}
      if (!name) errors.missingName = 'You must include the event name'
      const sponsorError = checkSponsorValidity(sponsors)
      if (sponsorError) errors.sponsorError = sponsorError

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors)
        return
      }

      // PASSED CHECKS, UPDATE EVENT
      const updatedEvent = await EventsDAO.updateEventSponsors(name, sponsors)
      sendEventNotification(updatedEvent, 'eventUpdated')
      return res.json({ success: updatedEvent })
    } catch (error) {
      console.error('findAndUpdateEvent error ::: ', error)
      return res.json({ error })
    }
  }

  static async findExpectedEventRevenue (req, res) {
    try {
      const { id } = req.params
      if (!id) return res.status(400).json({ error: 'Please include the event unique id' })

      const event = await EventsDAO.findEventByID(id)
      if (!event) return res.status(400).json({ error: 'No event found by that ID. Please check and resubmit' })

      const { expectedRevenue } = await calculateExpectedRevenue(event)
      return res.json({ expectedRevenue })
    } catch (error) {
      console.error('findExpectedEventRevenue error ::: ', error)
      return res.json({ error })
    }
  }
}
