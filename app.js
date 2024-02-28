// app.js
const express = require('express');
const contactController = require('./contactController');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/identify', contactController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
