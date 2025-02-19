const express = require('express');
const router = express.Router();
const catchAsync=require('../utils/catchAsync');// Importing the utility function to handle async errors gracefully
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds.js');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))    //ROUTE 1 : index : Route to display all campgrounds
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));     //ROUTE 4: post the request on index page : Route to handle form submission and add a new campground to the database
                                       

router.get('/new',isLoggedIn,campgrounds.renderNewForm);    //ROUTE 3: create new : Route to show a form for creating a new campground

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))     //ROUTE 2: show : Route to display details of a specific campground based on its ID
    .put(isLoggedIn, isAuthor, upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))     //ROUTE 6:put the changes on show page : Route to handle updates to specific campground
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));   //ROUTE 7: Delete : Route to handle deletion of specific campground


router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm)); //ROUTE 5: Edit : Route to display the edit form for a specific campground


module.exports = router;