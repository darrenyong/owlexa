const express = require('express');

const router = express.Router();
const crypto = require('crypto');

router.get('/test', (req, res) => {
  res.json({ msg: 'This test route is working' });
})

module.exports = router;