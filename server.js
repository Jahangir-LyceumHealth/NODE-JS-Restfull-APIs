
const express = require("express")
const bodyParser = require("body-parser")
//const mysqlConnection = require("./connection")
const PersonRoutes = require("./routes/person")
var app = express()

app.use(bodyParser.json())
app.use("/api/person", PersonRoutes)

app.get("/", (req, res)=>{
    console.log("/ i.e. root url called! !")
    res.status(200);
    res.send('Welcome to NodeJs home page - LyceumHealth APIs')
})


const port = process.env.port || 3000
app.listen(port)
