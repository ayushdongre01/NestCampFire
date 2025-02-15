const Campground = require('../models/campground');
const campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey=process.env.MAPTILER_API_KEY;

module.exports.index = async(req,res)=>{ //URL Path thus / before campgrounds
    const campgrounds=await campground.find({}); //fetch all campgrounds from the database
    res.render('campgrounds/index',{campgrounds}); //render the index template(ejs) from views/campgrounds and pass the campground data
};

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new'); //render the new template from views/campgrounds
};

module.exports.createCampground = async(req,res)=>{
    const geoData=await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1});
    const campground=new Campground(req.body.campground); //create new campground using the data from the submitted form
    campground.geometry = geoData.features[0].geometry;
    campground.images=req.files.map(f=>({url: f.path, filename: f.filename}));
    campground.author=req.user._id;
    await campground.save(); //Save the new campground to the database
    console.log(campground);
    req.flash('success','Successfully made a new campground!!!');
    res.redirect(`/campgrounds/${campground._id}`)//Redirect to the database of the newly created campground
};

module.exports.showCampground = async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author'); //Retrieve the campground with the specified id from the database,id is retrieved from the URL using req.params.id
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/show',{campground});//render the show template with the campground details
};

module.exports.renderEditForm = async(req,res)=>{
    const {id}=req.params;  //Extract the campground id from the URL parameters
    const campground = await Campground.findById(id); //fetch the campground from the database using the id
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});//render the edit template , here we have passed the campground data using {campground} to pre-fill the form fields
};


module.exports.updateCampground = async(req,res,next)=>{
    const {id}=req.params; //Extract the campground id from the request parameters
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});//Update the campground in the database with the new data in the request body
    const geoData=await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1});
    campground.geometry = geoData.features[0].geometry;
    const imgs=req.files.map(f=>({url:f.path, filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    }
    req.flash('success','Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`); //Redirect to the updated campground show page
};

module.exports.deleteCampground = async(req,res)=>{
    const {id}=req.params; //Extract the campground id from the request parameters
    await Campground.findByIdAndDelete(id); //Delete the campground from the database using the id
    req.flash('success','Successfully deleted the campground!');
    res.redirect('/campgrounds'); //Redirect to the list of all campgrounds after successful deletion
};