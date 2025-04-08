        const express = require('express');
        const pollsController = require('../controllers/polls.controller');
        // We no longer need votesController imported here if vote route is separate
        // const votesController = require('../controllers/votes.controller');

        const router = express.Router();

        // POST /api/polls - Create a new poll
        router.post('/', pollsController.createPoll);

        // GET /api/polls - Get a list of all polls
        router.get('/', pollsController.getAllPolls);

        // GET /api/polls/:id - Get details of a specific poll
        router.get('/:id', pollsController.getPollById);

        // DELETE /api/polls/:id - Delete a specific poll (New Route)
        router.delete('/:id', pollsController.deletePoll);

        module.exports = router;
        