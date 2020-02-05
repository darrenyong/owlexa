const express = require("express");
const router = express.Router();
const request = require("request");

router.get('/test', (req, res) => {
  res.json({ msg: 'This is working' })
})

router.post('/sendPR', (req, res) => {
  const resPayload = JSON.parse(req.body.payload);
  const pr = resPayload.pull_request;
  
  // Check if it's merged
  const prAction = resPayload.action;
  const prMergeStatus = pr.merged;
})

module.exports = router;
