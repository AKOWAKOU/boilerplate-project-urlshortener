const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');
const url = require('url');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory storage for URLs (replace with a database in a real project)
let urlDatabase = {};

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate the URL format
  const parsedUrl = url.parse(originalUrl);
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  // Use DNS to check if the domain exists
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Generate a short ID
      const shortUrl = shortid.generate();

      // Store the URL
      urlDatabase[shortUrl] = originalUrl;

      // Respond with the shortened URL
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// Endpoint to redirect to the original URL using the short URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // If the short URL is not found, respond with an error
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen on a port
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
