const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const request = require('request');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

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

  // Message types we don't care about
  const unwantedTypes = [
    'bot_message',
    'message_changed',
    'message_deleted'
  ]
  const messageType = req.body.event.subtype
  if (unwantedTypes.includes(messageType)) {
    return;
  }

  // Compare the generated Hash and the Slack Signature and respond
  if (crypto.timingSafeEqual(Buffer.from(mySig), Buffer.from(slackSig))) {
    const challenge = req.body.challenge;
    res.status(200).send(challenge);
    
    if (req.body.event.type == 'message') {
      const alexaRegex = /\b(Alexa|Owlexa)\b.*play (.*[a-zA-Z].*) by ([a-zA-Z].*)/gi;
      const message = req.body.event.text;

      const match = alexaRegex.exec(message);
      return;
    }
  } else {
    res.status(400).send('Could not be verified');
    return;
  }
})

router.post('/slashPlay', (req, res) => {
  // Logic to grab artist and song name
  const alexaRegex = /play (.*[a-zA-Z].*) by ([a-zA-Z].*)/ig;
  const phrase = req.body.text;
  const match = alexaRegex.exec(phrase);
  const songQuery = `${match[1]} ${match[2]}`;

  // Obtain temporary Spotify Bearer token
  const spotifySecret = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64');
  const spotifyAuthOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: 'client_credentials'
    },
    headers: {
      Authorization: `Basic ${spotifySecret}`
    }
  };
})

module.exports = router;