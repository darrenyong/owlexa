const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

router.get('/test', (req, res) => {
  res.json({ msg: 'This test route is working' });
})

router.post('/play', (req, res) => {
  // Get data needed for signing the request
  const reqBody = JSON.stringify(req.body);
  const slackTimestamp = req.headers['x-slack-request-timestamp'];
  const currentTime = Math.floor(new Date().getTime() / 1000);
  // Checks if the request has been sent more than 5 minutes ago
  // If so, ignore request
  if (Math.abs(currentTime - slackTimestamp) > (60 * 5)) {
    return;
  }

  const sigBaseString = `v0:${slackTimestamp}:${reqBody}`
  const sigHash = crypto.createHmac('sha256', slackSigningSecret)
                        .update(sigBaseString)
                        .digest('hex');

  console.log(sigHash);
  return ({
    challenge: {}
  });
})

module.exports = router;