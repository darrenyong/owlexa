const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const request = require('request');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

// Webhook - WIP 
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

// Slash Command
router.post('/slashPlay', (req, res) => {
  // Logic to grab artist and song name
  const alexaRegex = /play (.*[a-zA-Z].*) by ([a-zA-Z].*)/ig;
  const phrase = req.body.text;
  const match = alexaRegex.exec(phrase);
  const songQuery = `${match[1]} ${match[2]}`;
  const slackChannel = req.body.channel_id;

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

  request.post(spotifyAuthOptions, (err, httpResponse, body) => {
    const tempAccessToken = JSON.parse(body).access_token;
    const spotifyGetOptions = {
      url: "https://api.spotify.com/v1/search",
      qs: {
        q: songQuery,
        type: 'track',
        limit: 1,
      },
      headers: {
        Authorization: `Bearer ${tempAccessToken}`
      }
    };
    
    // Call Spotify API to retrieve song
    request(spotifyGetOptions, (err, httpResponse, body) => {
      const searchResults = JSON.parse(body)
      const returnedSong = searchResults.tracks.items[0].id;
      const messageOptions = {
        url: "https://slack.com/api/chat.postMessage",
        form: {
          channel: slackChannel,
          text: `https://open.spotify.com/track/${returnedSong}`
        },
        headers: {
          Authorization: `Bearer ${slackAccessToken}`
        }
      };

      request.post(messageOptions, (err, httpResponse, body) => {
        res.status(200).json({ 'response_type': 'in_channel' });
        return;
      })
    });
  });
})

module.exports = router;