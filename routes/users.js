const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');
const users = require('../controllers/users');
const { wrapAsync, validateCampground } = require('../utilities/middleware');

// Registration page
router.get('/register', users.registrationPage);

// Register a user
router.post('/register', wrapAsync(users.register));

// Login page
router.get('/login', users.loginPage);

// Logging in a user
router.post('/login', passport.authenticate('local',
    { failureFlash: true, failureRedirect: '/login' }), users.login)

// Logging out a user
router.get('/logout', users.logout);

module.exports = router;