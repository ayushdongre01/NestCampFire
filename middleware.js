const campground = require("./models/campground"); // Importing the Campground model
const { campgroundSchema, reviewSchema } = require('./schemas.js'); // Importing validation schemas for campgrounds and reviews
const Campground = require('./models/campground'); // Importing the Campground model again 
const ExpressError = require('./utils/ExpressError'); // Importing custom error-handling class
const Review = require('./models/review'); // Importing the Review model

// Middleware to store the previous page URL (returnTo) in session before redirecting
module.exports.storeReturnTo = (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo=req.session.returnTo; // Store returnTo URL in response locals
    }
    next();
}

// Middleware to check if a user is logged in before accessing protected routes
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){ // If user is not authenticated (inbuilt method in passport which is(means passport is) the global middleware function from app.js)
        req.session.returnTo=req.originalUrl;   // Store the URL they attempted to access
        req.flash('error','You must be signed first!');  // Flash an error message
        return res.redirect('/login');  // Redirect to login page
    }
    next();
}

// Middleware to check if the logged-in user is the author of the campground
module.exports.isAuthor = async(req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id); // Find campground by ID
    if(!campground.author.equals(req.user._id)){     // Check if logged-in user is the author, req.user is set by passport after authentication and it is from the user model 
        req.flash('error','You do not have permission to do that!');    // Flash an error message
        return res.redirect(`/campgrounds/${id}`);  // Redirect to the campground show page
    }
    next();
}

// Middleware to check if the logged-in user is the author of the review
module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);   // Find review by ID
    if(!review.author.equals(req.user._id)){    // Check if logged-in user is the author
        req.flash('error','You do not have permission to do that!');    // Flash an error message
        return res.redirect(`/campgrounds/${id}`);   // Redirect to the campground show page
    }
    next();
}

// Middleware to validate campground data before saving to the database
module.exports.validateCampground = (req, res, next) => {   
    const { error } = campgroundSchema.validate(req.body); // Validate request body using schema
    //console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',') // Extract and format error messages
        throw new ExpressError(msg, 400)    // Throw an ExpressError with status 400 (Bad Request)
    } else {
        next();  // Proceed to the next middleware if validation is successful
    }
}

// Middleware to validate review data before saving to the database
module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join('.');  // Joining all error messages
        throw new ExpressError(msg,400);  // Throwing error with status 400 (Bad Request)
    }
    else{
        next(); // Proceeding to the next middleware if validation is successful
    }
}