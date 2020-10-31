const express = require('express');
const path = require('path');
// const mongodb = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./config/db');
const authentication = require('../agriculture-backend/authentications');
const userRoute = require('../agriculture-backend/routes/user.route');
const agriculturistRoute = require('../agriculture-backend/routes/agriculturist.route');
const enterpriseRoute = require('../agriculture-backend/routes/enterprise.route');

// Schedulers.
const gardenCycle = require('../agriculture-backend/schedulers');
const growthCycle = require('../agriculture-backend/schedulers');


// // Connecting with mongo db.
// const MongoClient = mongodb.MongoClient;

// MongoClient.connect(db.url, (error, db) => {
//     if (error) {
//         console.error('Database could not connected: ' + error);
//         throw error;

//     } else {
//         console.log('Database sucessfully connected.');
//     }
// });

// Connecting with mongo db.
mongoose.connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});
const database = mongoose.connection;

// Check connection.
database.once('open', () => {
    console.log('Database sucessfully connected.');
});

// Check for database errors.
database.on('error', (error) => {
    console.log('Database could not connected: ' + error);
});

mongoose.set('useFindAndModify', false);


// Setting up port with express.
const app = express();

// Body Parser Middleware.
app.use(bodyParser.urlencoded({ extended: true }));
// Parse application/json.
app.use(bodyParser.json());

app.use(cors());    // CORS: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe

app.use('/user', userRoute);
app.use('/agriculturist', [authentication], agriculturistRoute);
app.use('/enterprise', [authentication], enterpriseRoute);

// Create port.
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}...`)
});


// Error handler.
app.use((err, req, res, next) => {
    console.error('Error:' + err.message);

    if (!err.statusCode) {
        err.statusCode = 500;
    }

   res.status(err.statusCode).send(err.message);
});