//ExpressError Class
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();  // Call the parent class (Error) constructor
        this.message = message;  // Set the error message
        this.statusCode = statusCode;  // Set the HTTP status code
    }
}

module.exports = ExpressError;  // Export the class for use in other files
