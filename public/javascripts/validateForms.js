// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
    //bsCustomInput.init();
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')  //all forms had class as validated-form for this validations 

    // Loop over them and prevent submission
    // Convert the 'forms' NodeList to an array so that we can use the 'forEach' method on it
    Array.from(forms)
        .forEach(function (form) { // Iterate over each form in the array
        form.addEventListener('submit', function (event) { 
            if (!form.checkValidity()) {  // Check if the form is valid using the built-in checkValidity() method
            event.preventDefault()   // If the form is not valid, prevent the form submission
            event.stopPropagation() // Stop the event from propagating further (no bubbling)
            }

            // Add the Bootstrap class 'was-validated' to the form
            // This class triggers visual feedback, such as showing validation messages and highlighting invalid fields
            form.classList.add('was-validated')
        }, false)    // Set to false to indicate that the event listener should not be captured in the capturing phase
        })
})()
