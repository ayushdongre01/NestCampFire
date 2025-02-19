const mongoose=require('mongoose');// Importing mongoose for MongoDB interaction
const Schema = mongoose.Schema;  // Extracting Schema from mongoose to define the structure of the database

// Defining the schema for the Review model
const reviewSchema = new Schema({
    body:String,    // Stores the content of the review
    rating:Number,  // Stores the rating given in the review
    author:{    //one-to-one relationship (one review written by one user)
        type:Schema.Types.ObjectId, // Reference to the User who wrote the review
        ref:'User'  // Refers to the User model to link the review with the specific user
    }
});

// Exporting the Review model based on the reviewSchema
module.exports = mongoose.model("Review",reviewSchema);