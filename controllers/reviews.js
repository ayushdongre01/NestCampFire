const Campground=require('../models/campground');
const Review = require('../models/review');

// Function to create a new review for a campground
module.exports.createReview = async(req,res)=>{
    const campground=await Campground.findById(req.params.id); // Find the campground by its ID from the request parameters
    const review = new Review(req.body.review);  // Create a new review using the review data from the request body
    review.author=req.user._id; // Set the author of the review to the currently authenticated user's ID
    campground.reviews.push(review); // Add the newly created review to the campground's reviews array
    await review.save();   // Save the review to the database
    await campground.save(); // Save the updated campground with the new review to the database
    req.flash('success','Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Function to handle review deletion
module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId}=req.params;  // Destructure 'id' (campground ID) and 'reviewId' (review ID) from the request parameters
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}); // Find the campground by ID and remove the review from its 'reviews' array using $pull
    await Review.findByIdAndDelete(reviewId);   // Delete the review document by its ID
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
};