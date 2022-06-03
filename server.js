const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const alert = require('alert');
const emailValidator = require('email-validator');
const zxcvbn = require('zxcvbn');
const bodyParser = require('body-parser');
const {check,validationResult} = require('express-validator');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport')


const initializePassport = require('./passportConfig')
const db_pool = require('./database');
const { jsonp } = require("express/lib/response");

initializePassport(passport)


app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized:false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())


const urlencodedParser = bodyParser.urlencoded({extended: false})

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

app.get('/dashboard', (req,res) => {
    res.render('dashboard')
})

app.post('/register',urlencodedParser,[
    check('email', 'Email is not valid').isEmail().normalizeEmail(),
    check('password','Password is not strong enough').isStrongPassword(),
    check('confirmPassword').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Password confirmation does not match password")
        }
        else {
            return true
        }
    }),
    check('firstname').isEmpty().trim().escape(),
    check('lastname').isEmpty().trim().escape()
] ,async (req,res) => {
    // Creating a user and inserting it into the database
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const alert = errors.array()
        console.log(alert)
        res.render('register',{
            alert, 
            first_name:firstname,
            last_name:lastname,
            email:email
        })
    }
    else {
        //Grabbing values from user
        const firstname = req.body.first_name
        const lastname = req.body.last_name
        const email = req.body.email
        const password = req.body.password
        const confirm_password = req.body.confirm_p
        const hashedPassword =  await bcrypt.hash(password, 10)

        // Creating cid and cpid for the database
        const cid = uuidv4();
        const cpid = uuidv4();

        // Score the password
        // Want to do something with the score but I don't know what
        console.log(zxcvbn(password))

        //Creating a new user
        const newUser_query = await db_pool.query(
            // Query to check to see if there is a duplicate email
            "SELECT COUNT(email) from client where client.email = $1",[email] ,(err,result) => {
                // If there is an error we just
                if (err){
                    console.log(err.message)
                    alert("Something went wrong while trying to create an account")
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

})

app.post('/', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}))

app.listen(3000, () => {
    console.log('http://localhost:3000')
})