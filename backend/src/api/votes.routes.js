const express = require('express');
const votesController = require('../controllers/votes.controller');

const router = express.Router();

// POST /api/options/:optionId/vote - Add a vote to a specific option
router.post('/options/:optionId/vote', votesController.addVote);

module.exports = router;