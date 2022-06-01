const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const alert = require('alert');
const emailValidator = require('email-validator')
const zxcvbn = require('zxcvbn');

const db_pool = require('./database');
const check_user = require('./check_user');

app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))

app.get('/', (req,res) => {
    res.render('homepage')
})

app.get('/register', (req,res) => {
    res.render('register', {
        first_name:"",
        last_name:"",
        email:""
    })
})

app.post('/register', async (req,res) => {
    console.log(req.body.email)
    try{
        // Creating a user and inserting it into the database
        //Grabbing values from user
        const firstname = req.body.first_name
        const lastname = req.body.last_name
        const email = req.body.email
        const password = req.body.password
        const confirm_password = req.body.confirm_p
        const hashedPassword =  await bcrypt.hash(password, 10)

        //Creating cid and cpid for the database
        const cid = uuidv4();
        const cpid = uuidv4();

        if(!firstname || !lastname || !email || !password || !confirm_password){
            console.log("EMPTY FIELD!")
            alert("All fields must be filled out.")
            res.redirect('/register')
        }
        else{
            //First check to see if the password and confirm password matches
            console.log(zxcvbn(password))
            if (check_user.password_match(password,confirm_password)){
                // Check to see if email is valid
                if(emailValidator.validate(email)){
                // Check to see if the email exists
                    const newUser_query = await db_pool.query(
                        // Query to check to see if there is a duplicate email
                        "SELECT COUNT(email) from client where client.email = $1",[email] ,(err,result) => {
                            // If there is an error we just
                            if (err){
                                console.log(err.message)
                                alert("Something went wrong while trying to create an email")
                                res.render('register',{
                                    first_name: firstname,
                                    last_name:lastname,
                                    email:email
                                })
                            }
                            // If there are duplicates, redirect the user back to the register with field already filled out
                            if(result.rows[0].count > 0){
                                console.log("EMAIL ALREADY EXISTS")
                                alert('User with that email already exists')
                                res.render('register',{
                                    first_name: firstname,
                                    last_name:lastname,
                                    email:email
                                });
                            }
                            else{
                                const newUser = db_pool.query(
                                    "INSERT INTO client VALUES ($1, $2, $3, NOW(), false, false)", 
                                    [cid, email, hashedPassword]
                                )

                                // Creating a user profile that is tied in with the data
                                const newprofile = db_pool.query(
                                    "INSERT INTO client_profile (cpid, cid, first_name, last_name) VALUES ($1, $2, $3, $4)",
                                    [cpid, cid,firstname,lastname], (err, results) => {
                                        if (err) {
                                            console.log(err.message)
                                            alert("Something went wrong")
                                            res.render('register',{
                                                first_name: firstname,
                                                last_name:lastname,
                                                email:email
                                            })
                                        }
                                        else{
                                            res.redirect('/')
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
                else{
                    console.log("Invalid email!")
                    res.render('register',{
                        first_name: firstname,
                        last_name:lastname,
                        email:email
                    })
                }
            }
            // If the passwords don't match render out register page again with given values
            else {
                alert("Your passwords does not match!")
                res.render('register',{
                    first_name: firstname,
                    last_name:lastname,
                    email:email
                })
            }
        }
    }
    catch (err){
        res.status(500).send("Uh-oh")
        console.error(err.message)
    }
    
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})