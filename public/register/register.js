const validator = require('validator')
const zxcvbn = require('zxcvbn')

function handleForm(e){
    e.preventDefault()
    
    // Grab the data from the form
    var first_name = document.getElementById('first_name').value
    var last_name = document.getElementById('last_name').value
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    var confirm_password = document.getElementById('confirmPassword').value

    //Check if there are any empty fields
    if(!validator.isEmpty(first_name) || !validator.isEmpty(last_name) || !validator.isEmpty(email) || !validator.isEmpty(password) || !validator.isEmpty(confirm_password)){
        alert("All fields must be filled.")
    }
    
    //Check if email is valid
    if (validator.isEmail(email)){
        //Sanitize email
        document.getElementById('email').value = validator.normalizeEmail(email)
        // Check two passwords if they are the same.
        if (password === confirm_password){
            // If the password is strong enough then submit the form and send it to the server.
            if(validator.isStrongPassword(password)){
                // Submit the form.
                document.getElementById('register_form').submit();
            }
            else {
                // different types of alerts cant be made
                alert('Password is not strong enough.')
            }
        }
        else {
            alert("Two passwords must match!")
        }
    }
    else{
        alert("Please enter a valid email")
    }
    
}