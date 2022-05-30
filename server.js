const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const users = []

app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))

app.get('/', (req,res) => {
    res.render('homepage')
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', async (req,res) => {
    try{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const user_id = uuidv4();
        const user = { id: user_id, name: req.body.name, email:req.body.email, password: hashedPassword}
        users.push(user)
    }
    catch{
        res.status(500).send("Uh-oh")
    }

    console.log(users)
    
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})