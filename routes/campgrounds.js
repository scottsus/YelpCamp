const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const { wrapAsync, validateCampground, isLoggedIn, isCampgroundAuthor } = require('../utilities/middleware');


// Index Page
router.get('/', wrapAsync(campgrounds.index));

// Create campground landing page
router.get('/new', isLoggedIn, campgrounds.newCampgroundForm);

// Create a Campground
router.post('/', upload.array('images'), validateCampground, wrapAsync(campgrounds.newCampground));

// Details Page
router.get('/:id', wrapAsync(campgrounds.details))

// Edit campground landing page
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, wrapAsync(campgrounds.editCampgroundForm));

// Edit a campground
router.put('/:id', isLoggedIn, isCampgroundAuthor, upload.array('images'), validateCampground, wrapAsync(campgrounds.editCampground));

// Delete a campground
router.delete('/:id', isLoggedIn, isCampgroundAuthor, wrapAsync(campgrounds.deleteCampground));

module.exports = router;