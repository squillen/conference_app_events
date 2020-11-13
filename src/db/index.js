const { MongoClient } = require('mongodb');
const app = require('../server/index');
const EventsDAO = require('./dao/eventsDAO');
const mongoURI = process.env.DB_URI || 'mongodb://localhost:27017/example-dev';
const port = process.env.PORT || 8080;

const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 50,
  connectTimeoutMS: 3000,
  keepAlive: 1,
});

async function connectToMongoDB() {
  try {
    await client.connect();
    const connections = [
      EventsDAO.injectDB(client),
    ];
    await Promise.all(connections);
    console.info('::: Successfully connected to MongoDB :::')
    app.listen(port, () => {
      console.info(`::: SERVER STARTED! Listening on port ${port} :::`)
    });
  } catch (e) {
    console.error('::: UNABLE TO CONNECT :::', e);
  }
}

connectToMongoDB();