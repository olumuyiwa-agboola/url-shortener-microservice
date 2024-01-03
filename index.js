// ------SETUP----------------------------------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// create express server
const app = express();

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// mount body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// mount cors for freeCodeCamp tests
app.use(cors());

// serve static assets
app.use('/public', express.static(`${process.cwd()}/public`));

// serve index.html
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// -----FUNCTIONS------------------------------------------------------
// short url generator
function generateShortUrl() {
  const length = 6;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

// ------MODELS-------------------------------------------------------
// url model
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: false
  },
  short_url: {
    type: String,
    required: true,
    unique: false
  },
});

const Url = mongoose.model('Url', urlSchema);

// ------ROUTES-------------------------------------------------------
// shorten a url
app.post('/api/shorturl', async function (req, res) {
  try {
    const original_url = req.body.url;

    const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s\/?\.#]+\.?)+(\/[^\s]*)?$/i;
    const validUrl = urlRegex.test(original_url);

    if (validUrl) {
      const find_url = await Url.findOne({ original_url: original_url });

      if (find_url) {
        res.json({
          original_url: find_url.original_url,
          short_url: find_url.short_url
        });
      } else {
        const short_url = generateShortUrl();

        const url = new Url({ original_url, short_url });
        await url.save();

        res.json({ original_url, short_url });
      }
    } else {
      res.json({ error: 'Invalid URL'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// redirect short url to original url
app.get('/api/shorturl/:shortUrl', async (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;

    const url = await Url.findOne({ short_url: shortUrl });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(url.original_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});














// -----LISTEN FOR REQUESTS---------------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, console.log(`Server started on port ${port}`));