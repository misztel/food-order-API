const { validationResult } = require('express-validator');

const Card = require('../models/card');
const Deck = require('../models/deck');
const User = require('../models/user');

// get Cards (specified deck!)
exports.getCards = (req, res, next) => {
  const { deckId } = req.params;

  Deck.findById(deckId)
    .then((deck) => {
      if (!deck) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      return deck.cards;
    })
    .then((cards) => {
      Card.find().where('_id').in(cards)
        .then((items) => {
          res.status(200).json({
            message: 'Cards fetched successfully!',
            cards: items
          });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// add Card (to specified deck!)
exports.postCard = (req, res, next) => {
  console.log('body', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data');
    error.statusCode = 422;
    throw error;
  }
  const { question } = req.body;
  const { answer } = req.body;
  const { deckId } = req.body;

  let author;
  let deck;
  const card = new Card({
    question,
    answer,
    author: req.userId,
    deck: deckId
  });
  card.save()
    .then((result) => User.findById(req.userId))
    .then((user) => {
      author = user;
      user.cards.push(card);
      return user.save();
    })
    .then((result) => Deck.findById(deckId))
    .then((currentDeck) => {
      deck = currentDeck;
      deck.cards.push(card);
      return deck.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Card created successfully',
        card,
        author: {
          _id: author._id,
          name: author.name
        },
        deck: {
          _id: deck._id,
          name: deck.name
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
// get single Card
exports.getCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        const error = new Error('Could not find card');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Card fetched.',
        card
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
// update card
exports.updateCard = (req, res, next) => {
  const { cardId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }
  const { question } = req.body;
  const { answer } = req.body;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        const error = new Error('Could not find card!');
        error.statusCode = 404;
        throw error;
      }
      card.question = question;
      card.answer = answer;
      return card.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Card updated successfully!', card: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
// delete single card
exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        const error = new Error('Could not find post!');
        error.statusCode = 404;
        throw error;
      }
      return card;
    })
    .then((card) => Deck.findById(card.deck))
    .then((deck) => {
      deck.cards.pull(cardId);
      return deck.save();
    })
    .then((result) => User.findById(req.userId))
    .then((user) => {
      user.cards.pull(cardId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Card deleted sucessfully' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// FEATURE: delete multiple cards after selection
