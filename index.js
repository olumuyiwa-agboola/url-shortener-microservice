// ------SETUP----------------------------------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// create express server
const app = express();

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// mount cors for freeCodeCamp tests
app.use(cors());

// serve static assets
app.use('/public', express.static(`${process.cwd()}/public`));

// serve index.html
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ------ROUTES-------------------------------------------------------
// shorten a url
app.post('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// redirect short url to original url
app.get('/api/shorturl/:url?', function(req, res) {
  res.json({ greeting: 'hello URL' });
});
















// -----LISTEN FOR REQUESTS---------------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, console.log(`Server started on port ${port}`));