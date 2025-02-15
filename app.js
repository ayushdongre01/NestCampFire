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
const session = require('express-session');
const flash=require('connect-flash');
const User=require('./models/user');
const passport=require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore=require('connect-mongo');
const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');


const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

// 'mongodb://127.0.0.1:27017/yelp_camp'
//Connecting to the mongoose database

const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp_camp';

mongoose.connect(dbURL) //database name is yelp_camp
    .then(()=>{
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err=>{
        console.log("OH NO MONGO CONNECTION ERROR!!");
        console.log(err);
    });

app.engine('ejs',ejsMate);//Sets ejs-mate as a template engine for EJS
app.set('view engine','ejs'); //Setting ejs for the template engine 
app.set('views',path.join(__dirname,'views')); //Setting the path for the views directory

app.use(express.urlencoded({extended:true})); //Middleware helps to parse the form data sent in the request body
app.use(methodOverride('_method'));//Enable method-override to support HTTP verbs like PUT and DELETE in HTML forms using _method query parameter
app.use(express.static(path.join(__dirname,'public')));

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

const secret = process.env.secret || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl:dbURL,
    touchAfter:24*60*60,
    crypto:{
        secret
    }
});

const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days from now
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days in milliseconds
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(mongoSanitize({
    replaceWith:'_'
}));

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dry6tmhnt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/',(req,res)=>{
    res.render('home');
})
app.use('/',userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);



// Catch-all route handler for undefined routes
app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found',404));  // Passes a 404 error to error handler
})

// Global error handler for the application
app.use((err,req,res,next)=>{
    const{statusCode=500, message='Something went wrong'}=err;  // Default error values
    if(!err.message) err.message='Oh No, something went wrong !';    // Default message if not provided
    res.status(statusCode).render('error',{err}); // Render error page with status and message
});

const port = process.env.PORT || 3000;

//Starting the server and listening on the port 3000
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
})