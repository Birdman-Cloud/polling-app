const express = require('express');
const pollsController = require('../controllers/polls.controller');
const votesController = require('../controllers/votes.controller'); // Import votes controller

const router = express.Router();

// POST /api/polls - Create a new poll
router.post('/', pollsController.createPoll);

// GET /api/polls - Get a list of all polls
router.get('/', pollsController.getAllPolls);

// GET /api/polls/:id - Get details of a specific poll
router.get('/:id', pollsController.getPollById);

// POST /api/polls/options/:optionId/vote - Vote for an option
// Changed route to be more RESTful and handled by votes controller
// router.post('/:pollId/vote', votesController.addVote); // Example if using pollId in path and optionId in body

// Let's define the vote route separately for clarity as initially planned.
// See votes.routes.js

module.exports = router;