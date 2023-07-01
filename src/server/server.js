const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Serve the static files from the build directory
app.use(express.static(path.join(__dirname, '..', 'build')));


app.get('/', (req, res) => {
  // Serve the index.html file from the build directory
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));

});

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while fetching the image.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
