const express = require('express');
const { body } = require('express-validator');

const cardController = require('../controllers/card');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Get all cards in specified deck
router.get('/cards/:deckId', cardController.getCards);

// Post card to deck
router.post('/card',
  [
    body('question')
      .trim()
      .isLength({ min: 5 }),
    body('answer')
      .trim()
      .isLength({ min: 5 })
  ], isAuth, cardController.postCard);

// Get single card
router.get('/card/:cardId', isAuth, cardController.getCard);

// Update card
router.put('/card/:cardId',
  [
    body('question')
      .trim()
      .isLength({ min: 5 }),
    body('answer')
      .trim()
      .isLength({ min: 5 })
  ], isAuth, cardController.updateCard);

// Delete card
router.delete('/card/:cardId', isAuth, cardController.deleteCard);

module.exports = router;
