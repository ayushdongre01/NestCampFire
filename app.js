// Load environment variables from .env file in development mode (not in production)
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}
//require('dotenv').config();
//Install express mongoose ejs
const express = require('express'); //Importing express framework
const app = express(); //Initializing express application
const path=require('path'); //Importing path module for working with directory paths
const mongoose = require('mongoose');//Importing mongoose for MongoDB interaction
const methodOverride = require('method-override'); //Middleware to enable PUT and DELETE request
const ejsMate = require('ejs-mate');//Adds layout and partial support for ejs templates
const ExpressError = require('./utils/ExpressError');// Importing the custom ExpressError class to handle errors in the application
const session = require('express-session'); // Middleware for session management
const flash=require('connect-flash');// Middleware for flash messages (success, error notifications)
const User=require('./models/user');// Importing User model for authentication
const passport=require('passport');// Authentication middleware
const LocalStrategy = require('passport-local');// Local strategy for user authentication with username & password
const mongoSanitize = require('express-mongo-sanitize');// Middleware to prevent NoSQL injection
const helmet = require('helmet'); // Middleware for securing HTTP headers
const MongoDBStore=require('connect-mongo');// Store session data in MongoDB for persistence
const { SitemapStream, streamToPromise } = require('sitemap'); // Generating XML sitemaps for SEO
const fs = require('fs');// File System module for handling file operations
/************************************************************************************************/


// Importing user-related routes 
const userRoutes = require('./routes/users');
// Importing routes for handling campgrounds
const campgroundsRoutes = require('./routes/campgrounds');
// Importing routes for handling reviews
const reviewsRoutes = require('./routes/reviews');



/************************************************************************************************/
// 'mongodb://127.0.0.1:27017/yelp_camp'
//Connecting to the mongoose database

// Set the database URL from environment variables or use the local MongoDB URL as a fallback
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp_camp';

// Connect to MongoDB using Mongoose
mongoose.connect(dbURL) //database name is yelp_camp
    .then(()=>{
        console.log("MONGO CONNECTION OPEN!!!");// Log success message when the connection is established
    })
    .catch(err=>{
        console.log("OH NO MONGO CONNECTION ERROR!!");// Log error message if connection fails
        console.log(err);// Display the error details
    });
/************************************************************************************************/






/************************************************************************************************/
app.engine('ejs',ejsMate);// Sets 'ejs-mate' as the template engine to allow layouts, partials, and boilerplate reuse in EJS
app.set('view engine','ejs'); // Sets 'ejs' as the default view engine for rendering templates
app.set('views',path.join(__dirname,'views'));// Specifies the directory where view templates are stored


app.use(express.urlencoded({extended:true})); // Middleware to parse incoming request body data (URL-encoded form data)
app.use(methodOverride('_method'));// Enables method-override to allow PUT and DELETE requests in HTML forms using the '_method' query parameter
app.use(express.static(path.join(__dirname,'public')));// Serves static files (CSS, JS, images, etc.) from the 'public' directory
/************************************************************************************************/




/***********************************************/
//for google search console
let sitemap;
app.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');

    // If sitemap is already generated, serve it
    if (sitemap) {
        return res.send(sitemap);
    }

    try {
        // Create a new sitemap stream
        const stream = new SitemapStream({ hostname: 'https://nestcampfire.onrender.com' });

        // Add important pages
        stream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        stream.write({ url: '/campgrounds', changefreq: 'daily', priority: 0.8 });
        stream.write({ url: '/login', changefreq: 'monthly', priority: 0.5 });
        stream.write({ url: '/register', changefreq: 'monthly', priority: 0.5 });

        // End stream
        stream.end();

        // Convert stream to XML
        sitemap = await streamToPromise(stream).then((data) => data.toString());

        res.send(sitemap);
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});
/***********************************************/




/************************************************************************************************/
// Retrieve the session secret from environment variables or use a default fallback
const secret = process.env.secret || 'thisshouldbeabettersecret!';

// Create a MongoDB session store for storing user sessions
const store = MongoDBStore.create({
    mongoUrl:dbURL,  // Connects the session store to the MongoDB database
    touchAfter:24*60*60,// Saves session data only once per day to reduce database load
    crypto:{
        secret  // Encrypts session data for security
    }
});

const sessionConfig = {
    store,  // Uses MongoDB as the session store
    name:'session',  // Custom name for the session cookie to improve security
    secret, // Secret key for encrypting session data
    resave: false,   // Prevents resaving session data if nothing has changed
    saveUninitialized: true,    // Saves new sessions even if they haven't been modified
    cookie: {
        httpOnly: true, // Restricts access to the cookie from JavaScript to enhance security
        secure:true, // cookies only over HTTPS (recommended for production)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Cookie expires in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // Sets the maximum cookie age to 7 days
        //user will be logged out automatically once the session expires after 7 days
    }
};

app.use(session(sessionConfig));// Enables session management using the defined session configuration
/************************************************************************************************/







app.use(flash());// Middleware to store temporary messages (flash messages) that persist for only one request cycle


/************************************************************************************************/
// These are global middleware functions, meaning that they are applied to all incoming requests across your app, not just specific routes
app.use(passport.initialize());// Initializes Passport for authentication
app.use(passport.session()); // Maintains user login sessions
passport.use(new LocalStrategy(User.authenticate())); // Configures Passport to use the LocalStrategy( uses a username and password for user login) for user authentication
passport.serializeUser(User.serializeUser());// Defines how user data is stored in the session
passport.deserializeUser(User.deserializeUser());// Defines how user data is retrieved from the session
/************************************************************************************************/




// Prevents NoSQL injection by removing harmful characters from user input
app.use(mongoSanitize({
    replaceWith:'_'
}));




/************************************************************************************************/
app.use(helmet());// Adds security headers to protect against common web vulnerabilities(XSS, CSP)

// Lists of allowed external sources for different types of content in the Content Security Policy (CSP)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/", // Bootstrap scripts
    "https://kit.fontawesome.com/",// FontAwesome icons
    "https://cdnjs.cloudflare.com/",// CDN for various JS libraries
    "https://cdn.jsdelivr.net", // JS libraries and frameworks
    "https://cdn.maptiler.com/", // MapTiler scripts for maps
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/", // FontAwesome free icons
    "https://stackpath.bootstrapcdn.com/", // Bootstrap styles
    "https://fonts.googleapis.com/",// Google Fonts
    "https://use.fontawesome.com/",// FontAwesome icons
    "https://cdn.jsdelivr.net",// Styles for various libraries
    "https://cdn.maptiler.com/", // MapTiler styles for maps
];

const connectSrcUrls = [
    "https://api.maptiler.com/", // Allows fetching map data from MapTiler API
];

// List of allowed external sources for fonts in the Content Security Policy (CSP)
const fontSrcUrls = []; //empty because no external font sources have been added

// Content Security Policy (CSP) configuration using Helmet to enhance security by restricting resource loading from specific sources.
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],// No default sources allowed
            connectSrc: ["'self'", ...connectSrcUrls], // Allowed sources for network requests (e.g., APIs)
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],// Allowed sources for scripts
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],// Allowed sources for stylesheets
            workerSrc: ["'self'", "blob:"], // Allowed sources for web workers
            objectSrc: [], // No external object sources allowed (e.g., Flash or other plugins)
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dry6tmhnt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! // Cloudinary account for storing images
                "https://images.unsplash.com/", // Unsplash images
                "https://api.maptiler.com/",// Maptiler API for maps
            ],
            fontSrc: ["'self'", ...fontSrcUrls],// Allowed sources for fonts
        },
    })
);
/************************************************************************************************/




// Middleware to set local variables accessible in all templates
app.use((req,res,next)=>{
    res.locals.currentUser = req.user; // Stores the currently logged-in user (if any) to be used in views
    res.locals.success=req.flash('success'); // Stores success messages from flash and makes them available in views
    res.locals.error = req.flash('error'); // Stores error messages from flash and makes them available in views
    next();
})






/*************************************************************************/
// Route for the home page, renders the 'home' template
app.get('/',(req,res)=>{
    res.render('home');
});
app.use('/',userRoutes);// Using userRoutes for handling authentication-related routes
app.use('/campgrounds',campgroundsRoutes);// Using campgroundsRoutes for handling all routes related to campgrounds 
app.use('/campgrounds/:id/reviews',reviewsRoutes);// Using reviewsRoutes for handling reviews on specific campgrounds
/*************************************************************************/





/*************************************************************************/
// Catch-all route handler for undefined routes
// If a user tries to access a route that doesn't exist, this middleware is triggered
app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found',404));  // Passes a 404 error to error handler
});

// Global error handler for the application
app.use((err,req,res,next)=>{
    const{statusCode=500, message='Something went wrong'}=err;  // Default error values
    if(!err.message) err.message='Oh No, something went wrong !';    // Default message if not provided
    res.status(statusCode).render('error',{err}); // Render error page with status and message
});

const port = process.env.PORT || 3000; // Uses environment variable for port, defaults to 3000 if not set

// Starts the server and listens on the defined port
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
});
/*************************************************************************/