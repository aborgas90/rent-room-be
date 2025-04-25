// server.js
const app = require('./app.js');
const connectDatabase = require('./database/database.js');
require('dotenv').config({path:['.env']})
const port = process.env.APP_PORT

// Connect to the database
connectDatabase();

// Log the current environment
if (process.env.NODE_ENV === 'development') {
    console.log(`Development environment detected. NODE_ENV = ${process.env.NODE_ENV}`, true);
} else if (process.env.NODE_ENV === 'test') {
    console.log(`Test environment detected. NODE_ENV = ${process.env.NODE_ENV}`, true);
}

// Start the server
app.listen(port, () => {
    console.log(`🌍 App listening on port ${port}`);
});