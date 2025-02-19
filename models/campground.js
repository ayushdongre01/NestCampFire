const mongoose = require('mongoose'); //Importing mongoose for MongoDB interaction
const Schema = mongoose.Schema; //Extracting Schema from mongoose for defining database structure
const Review = require('./review'); // Importing the Review model to reference in Campground

const opts={toJSON:{virtuals:true}};    // Options for schema to include virtuals when converting to JSON
// Virtual properties (e.g., `thumbnail` and `popUpMarkup`) will NOT be included in the JSON output


//Defining the Image Schema
const ImageSchema=new Schema({
    url:String, // Stores the URL of the image
    filename:String // Stores the filename of the image
})

// Virtual property to generate a smaller thumbnail version of the image
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200'); // Modifies the image URL for a 200px wide version (find out by changing the url of unsplash images)
})

// Defining the Campground schema
const CampgroundSchema = new Schema({
    title:String,   // Name of the campground
    images:[ImageSchema],    // Array of images associated with the campground
    geometry:{       // Stores location data using GeoJSON format
        type:{
            type:String,
            enum:['Point'], // Ensures only 'Point' type can be used
            required:true
        },
        coordinates:{
            type:[Number],   // Array containing latitude and longitude
            required:true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{    //one-to-one relationship
        type:Schema.Types.ObjectId, //this field will store an ObjectId (a unique MongoDB identifier)
        ref:'User'  // References the User model (campground owner)
    },
    reviews:[ //one-to-many relationship
        {
            type:Schema.Types.ObjectId,
            ref:"Review"     // References associated reviews from the Review model
        }
    ]
},opts);    // Applying options to include virtual properties in JSON responses


// Virtual property to generate a popup markup for displaying on maps
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return`<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.description.substring(0,20)}.....<p>`;
})

// Middleware to delete all associated reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
});

//Exporting the campground model named Campground based on the schema
module.exports=mongoose.model('Campground',CampgroundSchema);