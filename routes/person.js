const express = require("express")
const Router = express.Router()
const mysqlConnection = require("../connection")

Router.get("/", (req, res)=>{
    mysqlConnection.query("SELECT * FROM Persons", (err, rows, fields)=>{
        if(!(err)){
            res.send(rows)
        }
        else
        {
            console.log(err)
        }
    })
})


Router.post("/", (req, res)=>{
    if(!req.body.FirstName){
        res.send({"message": "Invalid request, FirstName is missing!", "status": 400})
        return
    }
    
    if(!req.body.LastName){
        res.send({"message": "Invalid request, LastName is missing!", "status": 400})
        return
    }

    var insert_sql = "INSERT INTO Persons (FirstName, LastName) VALUES ('"+req.body.FirstName+"', '"+req.body.LastName+"')";
    console.log(insert_sql)
    mysqlConnection.query(insert_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            res.send({"message": "Success.", "status": 0})
        }
        else
        {
            res.send(err)
        }
    });    
    
})


Router.delete("/", (req, res)=>{
    if(!req.body.personID){
        res.send({"message": "Invalid request, personID is missing!", "status": 400})
        return
    }
    
    var delete_sql = "DELETE FROM Persons WHERE Personid = "+req.body.personID;
    console.log(delete_sql)
    mysqlConnection.query(delete_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            if(result.affectedRows>0){
                res.send({"message": "Success.", "status": 0})
            }
            else
            {
                res.send({"message": "Invalid personID!", "status": 400})
            }
            
        }
        else
        {
            res.send(err)
        }
    });    
    
})

Router.put("/", (req, res)=>{
    if(!req.body.personID){
        res.send({"message": "Invalid request, personID is missing!", "status": 400})
        return
    }

    let setColumns = ''
    if(req.body.FirstName){
        setColumns = "FirstName = '" + req.body.FirstName + "'"
    }
    
    if(req.body.LastName){
        if(setColumns!='')
            setColumns +=", "
        setColumns += "LastName = '" + req.body.LastName + "'"
    }
    
    if(req.body.Age){
        if(setColumns!='')
            setColumns +=", "
        setColumns += "Age = " + req.body.Age
    }

    if(setColumns==''){
        res.send({"message": "Invalid request, field is missing to update!", "status": 400})
        return
    }

    var update_sql = "UPDATE Persons SET "+setColumns+" WHERE Personid = "+req.body.personID;
    console.log(update_sql)
    mysqlConnection.query(update_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            if(result.affectedRows>0){
                res.send({"message": "Success.", "status": 0})
            }
            else
            {
                res.send({"message": "Invalid personID!", "status": 400})
            }
            
        }
        else
        {
            res.send(err)
        }
    });    
    
})

module.exports = Router