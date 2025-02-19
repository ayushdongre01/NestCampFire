const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport=require('passport');
const {storeReturnTo}=require('../middleware');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login);
    // Passport.js middleware to authenticate the user using the 'local' strategy.
    // - 'failureFlash: true' enables flash messages on failure.
    // - 'failureRedirect: /login' redirects the user back to the login page if authentication fails.
    
router.get('/logout',users.logout);

module.exports = router;