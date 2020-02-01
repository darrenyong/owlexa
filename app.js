const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();

// API Routes
const owlexa = require('./routes/api/owlexa');
const github = require('./routes/api/github')

const app = express();
const port = process.env.PORT || 5000;

// Start up Server
app.listen(port, () => {});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json( {msg: 'This is Owlexa'} );
})

app.use('/owlexa', owlexa);