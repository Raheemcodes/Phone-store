const path = require('path');
const fs = require('fs');
// const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u4041.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/products');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const errorController = require('./controllers/error');

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' },
);

// app.use(helmet());
app.use((req, res, next) => {
  if (
    req.header('x-forwarded-proto') !== 'https' &&
    !req.header('host').includes('localhost')
  ) {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'Abdulraheemistheauthorofthispage',
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(authRoutes);
app.use(shopRoutes);
app.use('/admin', adminRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  let totalQuantity;

  if (req.session.isLoggedIn) {
    totalQuantity = req.user.cart.items.reduce(
      (prevVal, curVal) => prevVal + curVal.quantity,
      0,
    );
  }

  console.log(error);

  res.status(500).render('500', {
    pageTitle: 'Error',
    cartQuantity: totalQuantity || 0,
    isAuthenticated: req.session.isLoggedIn,
    searchInfo: '',
  });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
    console.log('Database Connected!');
  })
  .catch((err) => {
    console.log(err);
  });
