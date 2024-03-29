const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const cors = require('cors')

const mongoUrl = process.env.MONGO_URI


app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
require('dotenv').config();

mongoose.connect(mongoUrl,  { useCreateIndex: true, useNewUrlParser: true });
const connection = mongoose.connection;

connection.on('error', (err) => console.log(err.message));
connection.once('open', () => {
  console.log('MongoDB connection establishes successfully.');
});



app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
/**
* Api routing
*/
const exerciseRoutes = require('./routes/exercisesRoute');
app.use('/api/exercise', exerciseRoutes);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
