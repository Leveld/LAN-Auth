// Express server
const express = require('express');
// Exporess router
const router = express.Router();

// Get /authenticate
router.get('/', (req, res) => {
  res.json();
});
// Post /authenticate
router.post('/', (req, res) => {
  res.json();
});


module.exports = router;
