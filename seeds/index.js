const path=require('path'); //Importing path module for working with directory paths
const Campground = require('../models/campground'); //Importing the campground model to interact with database
const mongoose = require('mongoose');//Importing mongoose for MongoDB interaction
const {places,descriptors}=require('./seedHelpers'); //Importing seedHelpers for generating random titles
const cities = require('./cities'); //Importing cities data for random campground location
const { lookupService } = require('dns');//(Imported by default) Importing the 'lookupService' function from the 'dns' module, which is used for performing DNS lookups.
const { isPromise } = require('util/types');//(Imported by default) Importing the 'isPromise' function from the 'util/types' module, which is used to check if a given value is a Promise.
const { isDeepStrictEqual } = require('util');//(Imported by default) Importing the 'isDeepStrictEqual' function from the 'util' module, which is used to compare two values deeply and strictly (i.e., compares both values and their properties for equality).

//Connecting to the mongoose database
mongoose.connect('mongodb://127.0.0.1:27017/yelp_camp')  //database name is yelp_camp
    .then(()=>{
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err=>{
        console.log("OH NO MONGO CONNECTION ERROR!!");
        console.log(err);
    });

//Helper function to select the random element from array, it is reduced arrow function
const sample = array=> array[Math.floor(Math.random()*array.length)];

//Function to seed the database with the campground data
const seedDB = async()=>{
    await Campground.deleteMany({}); //delete all campgrounds from the database
    for(let i=0;i<50;i++){ //Creating 50 random campgrounds
        const random60 = Math.floor(Math.random()*60); //Generating a random index for cities
        const price=Math.floor(Math.random()*1600+800); //Generating a random price from 800 to 2400 
        const camp = new Campground({
            author:'67a3980e724052db1a695d22',
            location: `${cities[random60].city} ${cities[random60].state}`, //Random location
            title: `${sample(descriptors)} ${sample(places)}`,//Random title
            image: `https://picsum.photos/400?random=${Math.random()}`,
            price:price,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius repellendus accusantium quod exercitationem ut',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random60].longitude,
                    cities[random60].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dry6tmhnt/image/upload/v1739440113/NestCampFire/gyt6ih0rtc68peb3mm2f.jpg',
                  filename: 'NestCampFire/gyt6ih0rtc68peb3mm2f'
                },
                {
                  url: 'https://res.cloudinary.com/dry6tmhnt/image/upload/v1739440115/NestCampFire/qh9smyaotpyzmivwgiqp.jpg',
                  filename: 'NestCampFire/qh9smyaotpyzmivwgiqp'
                }
              ],
        })
        await camp.save();  //Saving the campground to the database
    }
}


//Running the seed function and closing the connection after seeding
seedDB().then(()=>{
    mongoose.connection.close();
})