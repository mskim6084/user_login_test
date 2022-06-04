const LocalStrategy = require('passport-local')
const pool = require('./database')
const bcrypt = require('bcrypt')

function initialize(passport){
    const authenticateUser = (email, password, done) => {
        pool.query(
            'SELECT * FROM client WHERE email = $1', 
            [email], 
            (err,result) => {
                if(err){
                    throw err
                }
                if (result.rows.length > 0){
                    const user = result.rows[0];
                    bcrypt.compare(password, user.password, (err,isMatch)=> {
                        if (err){
                            throw err;
                        }
                        if (isMatch){
                            return done(null, user)
                        }
                        else {
                            return done(null, false, {message: "Password is not correct"})
                        }
                    })
                }
                else{
                    return done(null, false, {message: "email does not registered"})
                }
            }
        )
    }
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.cid))
    passport.deserializeUser((cid, done) => {
        pool.query(
            'SELECT * FROM client WHERE cid = $1', [cid], (err, result) => {
                if (err){
                    throw err;
                }
                return done(null,result.rows[0])
            }
        )
    })
}

module.exports = initialize;