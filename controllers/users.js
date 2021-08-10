const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');

module.exports.registrationPage = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
};

module.exports.loginPage = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const prevUrl = req.session.returnTo;
    delete req.session.returnTo;
    if (prevUrl) {
        res.redirect(prevUrl);
    } else {
        res.redirect('/campgrounds');
    }
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/campgrounds');
};

