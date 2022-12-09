require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const nodemailer = require('nodemailer');

// const postRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');
const userAdminRoutes = require('./routes/admin/user');
const authRoutes = require('./routes/auth');
// const restaurantRoutes = require('./routes/restaurant');
const restaurantAdminRoutes = require('./routes/admin/restaurant');
const itemCategoryAdminRoutes = require('./routes/admin/itemCategory');
const imageRoutes = require('./routes/image');

const deckRoutes = require('./routes/deck');
const cardRoutes = require('./routes/card');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/upload', express.static(path.join(__dirname, 'upload')));

// CORS Headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// app.use('/api', postRoutes);
app.use('/auth', authRoutes);
app.use('/api', userRoutes, deckRoutes, cardRoutes, imageRoutes);
app.use('/admin', userAdminRoutes, restaurantAdminRoutes, itemCategoryAdminRoutes);

// err handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const { message } = error;
  const { data } = error;
  res.status(status).json({ message, data });
});

// database connection
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.gmy1b.mongodb.net/${process.env.MONGODB_DATABASE}`
  )
  .then(() => {
    app.listen(8080);
    console.log('Connection to the database established');
  })
  .catch((err) => console.log(err));

// Mailing
// const transport = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   auth: {
//     user: 'misztel018@gmail.com',
//     pass: ''
//   }
// });

// const mailOptions = {
//   from: '"Test Mail" <misztel018@gmail.com>',
//   to: 'misztel018@gmail.com',
//   subject: 'Nice Nodemailer test',
//   text: 'Hey there, it’s our first message sent with Nodemailer ;) ',
//   html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
// };

// transport.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.log(error);
//   }
//   console.log('Message sent: %s', info.messageId);
// });
