const express = require("express")
const app = express()

app.set('view engine','ejs')

app.get('/', (req,res) => {
    console.log('http://localhost:3000')
    res.render('homepage')
})

app.listen(3000)