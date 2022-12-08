const express = require('express');
const { body } = require('express-validator');

const deckController = require('../controllers/deck');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Get all decks
router.get('/decks', deckController.getDecks);

// Add new deck
router.post('/deck',
  isAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 5 })
  ],
  deckController.postDeck);

router.get('/deck/:deckId', isAuth, deckController.getDeck);

router.put('/deck/:deckId', [
  body('name')
    .trim()
    .isLength({ min: 5 })
], isAuth, deckController.updateDeck);

router.delete('/deck/:deckId', isAuth, deckController.deleteDeck);

module.exports = router;
