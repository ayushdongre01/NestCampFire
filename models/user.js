const mongoose = require('mongoose'); // Importing mongoose for MongoDB interaction
const Schema = mongoose.Schema;  // Extracting Schema from mongoose to define the structure of the database
const passportLocalMongoose = require('passport-local-mongoose');  // Importing passport-local-mongoose for easy authentication handling

// Defining the schema for the User model
const UserSchema = new Schema({
    email: {  // The user's email address
        type: String,
        required: true,
        unique: true    // Ensures that the email is unique across users (no duplicates)
    }
});

// Adding passport-local-mongoose plugin to the schema for built-in authentication methods
UserSchema.plugin(passportLocalMongoose);  // This plugin provides methods like 'register', 'authenticate', etc., for handling user authentication

// Exporting the User model based on the UserSchema
module.exports = mongoose.model('User', UserSchema);


/*By default, passport-local-mongoose uses the username field to store the user's login name.
 If you don't explicitly define a username field in the UserSchema, it will still create and handle
a username field behind the scenes.
Similarly, passport-local-mongoose adds a password field, which will store the hashed password.
You don't need to define the password field yourself. */