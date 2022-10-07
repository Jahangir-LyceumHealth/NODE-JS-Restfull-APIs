
const express = require("express")
const bodyParser = require("body-parser")
const mysqlConnection = require("./connection")
const feedbackTypeRoutes = require("./routes/feedbackType")
var app = express()

app.use(bodyParser.json())
app.use("/api/hmp/feedbackType", feedbackTypeRoutes)


app.get("/", (req, res)=>{
    res.status(200).send('Welcome to NodeJs home page - LyceumHealth APIs 20221007')
})


const port = process.env.port || 3000
app.listen(port)
