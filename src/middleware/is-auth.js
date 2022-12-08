require('dotenv').config();
const jwt = require('jsonwebtoken');

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: 'Unauthorized! Access Token was expired!' });
  }

  return res.sendStatus(401).send({ message: 'Unauthorized!', err });
};

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token, process.env.JWT_EXPIRATION);
  if (!token) {
    const error = new Error('No token provided.');
    error.statusCode = 401;
    throw error;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('decoded', decoded);
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};
