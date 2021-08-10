const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { wrapAsync, validateCampground, validateReview, isLoggedIn, isReviewAuthor } = require('../utilities/middleware');


// Creating new review
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(reviews.newReview));

// Deleting a review
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;