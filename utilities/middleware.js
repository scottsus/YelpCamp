const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');
const ExpressError = require('./ExpressError');


module.exports.wrapAsync = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err));
    }
}

module.exports.validateCampground = function (req, res, next) {
    const result = campgroundSchema.validate(req.body);
    if (result.error) {
        const message = result.error.details.map(err => err.message).join(', ');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

module.exports.validateReview = function (req, res, next) {
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        const message = result.error.details.map(err => err.message).join(', ');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        res.redirect('/login');
    } else {
        next();
    }
}

module.exports.isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for this action!');
        res.redirect(`/campgrounds/${id}`);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for this action!');
        res.redirect(`/campgrounds/${id}`);
    } else {
        next();
    }
}