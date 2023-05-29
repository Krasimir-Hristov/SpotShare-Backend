const express = require("express");
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use(placesRoutes);


app.listen(5000);
console.log('Server works on: http://localhost:5000');