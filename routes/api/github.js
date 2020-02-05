const express = require("express");
const router = express.Router();
const request = require("request");

const slackPrAccessToken = process.env.SLACK_PR_ACCESS_TOKEN;
const slackPrChannel = process.env.SLACK_PR_CHANNEL;

router.get('/test', (req, res) => {
  res.json({ msg: 'This is working' })
})

router.post('/sendPR', (req, res) => {
  const resPayload = JSON.parse(req.body.payload);
  const pr = resPayload.pull_request;
  
  // Check if it's merged
  const prAction = resPayload.action;
  const prMergeStatus = pr.merged;

  // Info for message
  const prNum = resPayload.number;
  const prAuthor = pr.user.login;
  const prUrl = pr.url;
  const prTitle = pr.title;
  
  if (prAction == 'closed' && prMergeStatus) {
    console.log('This only fires when merged');
  }
  
  // console.log(prAuthor, prNum, prAction, prMergeStatus, prUrl, prTitle);
})

module.exports = router;
