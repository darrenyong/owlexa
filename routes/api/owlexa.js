const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

router.get('/test', (req, res) => {
  res.json({ msg: 'This test route is working' });
})

router.post('/play', (req, res) => {

  // console.log(reqBody);
  return ({
    challenge: {}
  });
})

module.exports = router;