require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const cors = require('cors');

const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const fs = require('fs');

const nodemailer = require('nodemailer');

const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/mmisztelaapi.pl/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mmisztelaapi.pl/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/mmisztelaapi.pl/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca
};

app.use(cors(
  {
    credentials: true,
    origin: ['https://host424213.xce.pl', 'http://localhost:3000', 'http://localhost:3001', 'https://mmisztelaapi.pl', 'http://mmisztelaapi.pl'],
    allowedHeaders: 'Accept, Authorization, Content-Type, X-Requested-With, Range',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
));

// CORS Headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://host424213.xce.pl', 'https://mmisztelaapi.pl', 'http://mmisztelaapi.pl'];
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const server = http.createServer(credentials, app);

const io = socketIo(server, {
  cors: {
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://host424213.xce.pl', 'https://mmisztelaapi.pl', 'http://mmisztelaapi.pl']
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('create', (room) => {
    socket.join(room);
    console.log('room ', room, ' created');
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
  io.to('order').emit('time', new Date());
}, 2000);

// const postRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');
const userAdminRoutes = require('./routes/admin/user');
const authRoutes = require('./routes/auth');
// const restaurantRoutes = require('./routes/restaurant');
const restaurantAdminRoutes = require('./routes/admin/restaurant');
const itemCategoryAdminRoutes = require('./routes/admin/itemCategory');
const itemOptionsGroupAdminRoutes = require('./routes/admin/itemOptionsGroup');
const itemOptionsAdminRoutes = require('./routes/admin/itemOption');
const imageRoutes = require('./routes/image');
const itemAdminRoutes = require('./routes/admin/item');
const deliveryAdminArea = require('./routes/admin/deliveryArea');
const orderAdminRoutes = require('./routes/admin/order');
const hourAdminRoutes = require('./routes/admin/hour');
const restaurantInfoAdminRoutes = require('./routes/admin/restaurantInfo');

const cartRoutes = require('./routes/user/cart');

const itemCategoryRoutes = require('./routes/user/itemCategory');
const orderRoutes = require('./routes/user/order');
const itemRoutes = require('./routes/user/item');
const restaurantRoutes = require('./routes/user/restaurant');
const itemOptionsGroupRoutes = require('./routes/user/itemOptionsGroup');
const itemOptionRoutes = require('./routes/user/itemOption');
const deckRoutes = require('./routes/deck');
const cardRoutes = require('./routes/card');
const deliveryRoutes = require('./routes/user/delivery');
const paymentRoutes = require('./routes/user/payment');
const hoursRoutes = require('./routes/user/hours');
const restaurantInfoRoutes = require('./routes/user/restaurantInfo');

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/upload', express.static(path.join(__dirname, 'upload')));

// app.use('/api', postRoutes);
app.use('/auth', authRoutes);
app.use(
  '/api',
  userRoutes,
  deckRoutes,
  cardRoutes,
  imageRoutes,
  itemCategoryRoutes,
  itemRoutes,
  itemOptionsGroupRoutes,
  itemOptionRoutes,
  cartRoutes,
  restaurantRoutes,
  orderRoutes,
  deliveryRoutes,
  paymentRoutes,
  hoursRoutes,
  restaurantInfoRoutes
);

app.use(
  '/admin',
  userAdminRoutes,
  restaurantAdminRoutes,
  itemCategoryAdminRoutes,
  itemAdminRoutes,
  itemOptionsGroupAdminRoutes,
  itemOptionsAdminRoutes,
  deliveryAdminArea,
  orderAdminRoutes,
  hourAdminRoutes,
  restaurantInfoAdminRoutes
);

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
    server.listen(process.env.PORT);
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
