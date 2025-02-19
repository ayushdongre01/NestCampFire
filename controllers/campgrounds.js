const Campground = require('../models/campground');
const campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey=process.env.MAPTILER_API_KEY;

//Function to fetch all campgrounds from the database and render the index page.
module.exports.index = async(req,res)=>{ // URL Path thus / before campgrounds
    const campgrounds=await campground.find({}); //fetch all campgrounds from the database
    res.render('campgrounds/index',{campgrounds}); //render the index template(ejs) from views/campgrounds and pass the campground data
};

//function to render the form for creating a new campground.
module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new'); //render the new template from views/campgrounds
};

//function to create a new campground
module.exports.createCampground = async(req,res)=>{
    const geoData=await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1}); // Fetch geolocation data using MapTiler API based on the campground's location
    const campground=new Campground(req.body.campground); // Create a new Campground instance using form data
    campground.geometry = geoData.features[0].geometry;  // Store the retrieved geometry (coordinates) from the geolocation API
    campground.images=req.files.map(f=>({url: f.path, filename: f.filename}));  // Map uploaded files to store image URLs and filenames
    campground.author=req.user._id; // Associate the campground with the currently logged-in user
    await campground.save(); //Save the new campground to the database
    //console.log(campground);
    req.flash('success','Successfully made a new campground!!!');
    res.redirect(`/campgrounds/${campground._id}`)//Redirect to the database of the newly created campground
};

//Retrieves a specific campground from the database and renders its details page.
module.exports.showCampground = async(req,res)=>{
    // Retrieve the campground with the specified ID, including reviews and their authors,id is retrieved from the URL using req.params.id
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');  // Populate the campground's author details
    //populate('author') replaces the ObjectId in campground.author with the actual user document, allowing direct access to the author's details.

    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/show',{campground});//render the show template with the campground details
};

// Renders the edit form for an existing campground
module.exports.renderEditForm = async(req,res)=>{
    const {id}=req.params;  //Extract the campground id from the URL parameters
    const campground = await Campground.findById(id); //fetch the campground from the database using the id
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});//render the edit template , here we have passed the campground data using {campground} to pre-fill the form fields
};

//function to update an existing campground with new details provided by the user
module.exports.updateCampground = async(req,res,next)=>{
    const {id}=req.params; //Extract the campground id from the request parameters
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});//Update the campground in the database with the new data in the request body
    const geoData=await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1});   // Fetch geolocation data for the updated location using MapTiler API
    campground.geometry = geoData.features[0].geometry;  // Store the retrieved geometry data in the campground object
    const imgs=req.files.map(f=>({url:f.path, filename:f.filename}));   // Process uploaded images and add them to the campground
    campground.images.push(...imgs);
    await campground.save();     // Save the updated campground details
    // If images are marked for deletion, remove them from Cloudinary and the database
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename); // Delete the image from Cloudinary
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}}); // Remove references to deleted images from the campground document
    }
    req.flash('success','Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`); //Redirect to the updated campground show page
};

//function to delete an existing campground from the database.
module.exports.deleteCampground = async(req,res)=>{
    const {id}=req.params; //Extract the campground id from the request parameters
    await Campground.findByIdAndDelete(id); //Delete the campground from the database using the id
    req.flash('success','Successfully deleted the campground!');
    res.redirect('/campgrounds'); //Redirect to the list of all campgrounds after successful deletion
};

//Mongoose aliases findByIdAndDelete(id) to findOneAndDelete({ _id: id }), so the post('findOneAndDelete') middleware still executes.
// ✅ findByIdAndDelete(id) internally calls → findOneAndDelete({ _id: id })
// ✅ Since your middleware is listening to findOneAndDelete, it gets triggered automatically.

