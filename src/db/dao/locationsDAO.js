const ObjectId = require('mongodb').ObjectId
let locations

module.exports = class LocationsDAO {
  static async injectDB (conn) {
    if (locations) return
    try {
      const dbName = process.env.DB_NAME || 'development'
      locations = await conn.db(dbName).collection('locations')
      console.info('::: LocationsDAO connected :::')
    } catch (e) {
      console.error(`Unable to establish collection connections in LocationsDAO: ${e}`)
    }
  }

  static async createNewLocation (eventInfo) {
    try {
      const success = await locations.insertOne(eventInfo, { writeConcern: 2 })
      return { success }
    } catch (error) {
      console.error(error)
      return { error }
    }
  }

  static async findAndUpdateLocation (location) {
    const { _id } = location
    try {
      return await locations.updateOne(
        { _id },
        { $set: location },
      )
    } catch (e) {
      console.error('Error in findAndUpdateLocation()', e)
      return null
    }
  }
}
