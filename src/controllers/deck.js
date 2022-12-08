const { validationResult } = require('express-validator');

const Deck = require('../models/deck');
const User = require('../models/user');

exports.getDecks = (req, res, next) => {
  Deck.find()
    .then((decks) => {
      res.status(200).json({
        message: 'Decks fetched successfully!',
        decks
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postDeck = (req, res, next) => {
  console.log('post deck', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }
  const { name, difficulty, tags } = req.body;
  let author;
  const deck = new Deck({
    name,
    difficulty,
    tags,
    author: req.userId
  });
  deck.save()
    .then((result) => User.findById(req.userId))
    .then((user) => {
      author = user;
      user.decks.push(deck);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Deck created successfully!',
        deck,
        author: {
          _id: author._id,
          name: author.name
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

exports.getDeck = (req, res, next) => {
  const { deckId } = req.params;

  Deck.findById(deckId)
    .then((deck) => {
      if (!deck) {
        const error = new Error('Could not find deck');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Deck fetched.',
        deck
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateDeck = (req, res, next) => {
  const { deckId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }
  const { name } = req.body;
  Deck.findById(deckId)
    .then((deck) => {
      if (!deck) {
        const error = new Error('Could not find deck!');
        error.statusCode = 404;
        throw error;
      }
      deck.name = name;
      return deck.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Deck updated successfully', deck: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteDeck = (req, res, next) => {
  const { deckId } = req.params;
  Deck.findById(deckId)
    .then((deck) => {
      if (!deck) {
        const error = new Error('Could not find deck!');
        error.statusCode = 404;
        throw error;
      }
      return Deck.findByIdAndRemove(deckId);
    })
    .then((result) => User.findById(req.userId))
    .then((user) => {
      user.decks.pull(deckId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Deck deleted successfully!' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
