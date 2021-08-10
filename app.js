if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const path = require('path');
const methodOverride = require('method-override');
const express = require('express');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError');
const { wrapAsync, validateCampgrounds, validateReview } = require('./utilities/middleware')
const { campgroundSchema, reviewSchema } = require('./schemas');

const app = express();
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const port = 5000;

mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('Database Connected!');
    })
    .catch(err => {
        console.log('ERROR!');
        console.log(err);
    })

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'endpoints'));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR", err)
})

const sessionConfig = {
    store: store,
    name: 'secretsession',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());

// Flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

// Campground Route Handler
app.use('/campgrounds', campgroundRoutes);

// Review Route Handler
app.use('/campgrounds', reviewRoutes);

// User Route Handler
app.use('/', userRoutes);

// Catch wrong URLs
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Error handling custom middleware
app.use((err, req, res, next) => {
    console.log(err)
    const { message = 'Something went wrong!', statusCode = 500 } = err;
    res.status(statusCode).render('error', { message, statusCode });
})

// Listener
app.listen(port, () => {
    console.log(`Listening to Port: ${port}!`)
})
