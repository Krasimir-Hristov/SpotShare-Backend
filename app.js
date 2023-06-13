const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Serve static files
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch(error => {
    console.log(error);
  });



