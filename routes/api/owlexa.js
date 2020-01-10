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
  // Ignore if the request was sent more than 10 minutes ago
  if (Math.abs(currentTime - slackTimestamp) > (60 * 10)) {
    res.status(498).send('Request expired');
  }
  // Create Base String and Hash
  const sigBaseString = `v0:${slackTimestamp}:` + reqBody
  const mySig = "v0=" + crypto.createHmac('sha256', slackSigningSecret)
                              .update(sigBaseString)
                              .digest('hex');
  const slackSig = req.headers['x-slack-signature'];

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