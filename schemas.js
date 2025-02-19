// Importing Joi for data validation (to validate input data)
const BaseJoi = require('joi');

// Importing sanitize-html to clean HTML tags from user input
const sanitizeHTML = require('sanitize-html');

// Extension to Joi to add custom validation for strings to escape HTML tags
const extension = (joi) => ({
    type: 'string', // Defining a new string type validation
    base: joi.string(), // Base type is a regular Joi string
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!' // Custom error message for HTML content
    },
    rules: {
        // Custom rule to escape HTML tags from the string value
        escapeHTML: {
            validate(value, helpers) {
                // Clean the string by removing all HTML tags
                const clean = sanitizeHTML(value, {
                    allowedTags: [], // No HTML tags are allowed
                    allowedAttributes: {} // No attributes allowed in tags
                });

                // If the cleaned string differs from the original, return an error
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                
                // Return the cleaned string if no HTML content was found
                return clean;
            }
        }
    }
});

// Extending Joi with the custom escapeHTML rule
const Joi = BaseJoi.extend(extension);

// Exporting campground schema for validation
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
            title: Joi.string().required().escapeHTML(),  // Title of the campground
            price: Joi.number().required(),  // Price of the campground
            location: Joi.string().required().escapeHTML(),  // Location of the campground
            description: Joi.string().required().escapeHTML(),  // Description of the campground
        }).required(),  // Ensure campground object is present
        deleteImages:Joi.array(),
        //image:Joi.any()
});


// Exporting the schema for validating Review data
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), // Rating field (required, must be between 1 and 5)
        body: Joi.string().required().escapeHTML() // Review body (required and sanitized)
    }).required()  // Ensure the review object is present and valid
});