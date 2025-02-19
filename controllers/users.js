const User = require('../models/user');

//Function to render the register page 
module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
};

// Function to register a new user
module.exports.register = async(req,res,next)=>{
    try{
        // Extract email, username, and password from the request body
        const {email,username,password}=req.body;
        // Create a new User instance with the provided email and username
        // The password is not set here because we use Passport.js's `register` method
        const user=new User({email,username});
        // Register the user using `register` method provided by passport-local-mongoose in model
        // This will hash the password and store it securely in the database
        const registeredUser=await User.register(user,password); //data is stored in the database
        // Automatically log in the user after successful registration
        req.login(registeredUser,err=>{
            if (err) return next(err); // If an error occurs, pass it to the error handler, shown by using error.ejs
            req.flash('success','Welcome to NestCampFire');
            res.redirect('/campgrounds');
        });
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/campgrounds');
    }
};

//function to render the login page
module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
};

// Function to handle user login after successful authentication
module.exports.login = (req,res)=>{
    req.flash('success','Welcome back!');
    // Check if there's a 'returnTo' URL stored in locals (i.e., the page the user attempted to access before login).
    // If 'returnTo' exists, redirect the user to that URL. Otherwise, redirect to '/campgrounds'.
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};

// Function to handle user logout
module.exports.logout = (req,res,next)=>{
    // Call the 'logout' method provided by Passport.js to log out the user.
    req.logout(function(err){
        if(err){
            return next(err);    // If there's an error during logout, pass it to the next middleware (error handler). show by using error.ejs
        }
        req.flash('success','Good Bye!');
        res.redirect('/campgrounds');
    });
};