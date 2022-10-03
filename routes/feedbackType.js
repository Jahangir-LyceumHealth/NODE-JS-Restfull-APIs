const express = require("express")
const Router = express.Router()
const mysqlConnection = require("../connection")

Router.get("/", (req, res)=>{
    mysqlConnection.lyceum_msp_2.query("SELECT * FROM msp_feedback_type", (err, rows, fields)=>{
        if(!(err)){
            res.status(200).send(rows)
        }
        else
        {
            //console.log(err)
            res.status(200).send({"message": "Empty records!", "status": 300})
        }
    })
})


Router.post("/", (req, res)=>{    
    if(!req.body.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.body.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
    }

    if(!req.body.feedbackTypeName){
        res.status(200).send({"message": "Invalid request, feedbackTypeName is missing!", "status": 400})
        return
    }
    
    if(!req.body.feedbackTypeDescription){
        res.status(200).send({"message": "Invalid request, feedbackTypeDescription is missing!", "status": 400})
        return
    }

    var insert_sql = "INSERT INTO msp_feedback_type (name, description) VALUES ('"+req.body.feedbackTypeName+"', '"+req.body.feedbackTypeDescription+"')";
    console.log(insert_sql)
    mysqlConnection.lyceum_msp_2.query(insert_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            //res.status(200).send({"message": "Success.", "status": 0})

            /*  
            * START   
            *  HANDLE TO SET externalFeedbackTypeID AS THEIR CURRENT PK i.e. on creation externalFeedbackTypeID has to always as their pk 
            */
            var update_sql = "UPDATE msp_feedback_type SET externalFeedbackTypeID="+result.insertId+" WHERE pk = "+result.insertId;
            console.log(update_sql)
            mysqlConnection.lyceum_msp_2.query(update_sql, function (err, result) {
                if(!(err)){
                    console.log(result)
                    if(result.affectedRows>0){
                        res.status(200).send({"message": "Success.", "status": 0})
                    }
                    else
                    {
                        res.status(200).send({"message": "Invalid externalFeedbackTypeID!", "status": 400})
                    }
                    
                }
                else
                {
                    res.status(200).send(err)
                }
            });  
            /*  
            *  HANDLE TO SET externalFeedbackTypeID AS THEIR CURRENT PK i.e. on creation externalFeedbackTypeID has to always as their pk 
            * END   
            */
            
        }
        else
        {
            res.status(200).send(err)
        }
    });    
    
})


Router.delete("/", (req, res)=>{
    if(!req.body.feedbackTypeID){
        res.status(200).send({"message": "Invalid request, feedbackTypeID is missing!", "status": 400})
        return
    }
    
    var delete_sql = "DELETE FROM msp_feedback_type WHERE pk = "+req.body.feedbackTypeID;
    console.log(delete_sql)
    mysqlConnection.query(delete_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            if(result.affectedRows>0){
                res.status(200).send({"message": "Success.", "status": 0})
            }
            else
            {
                res.status(200).send({"message": "Invalid feedbackTypeID!", "status": 400})
            }
            
        }
        else
        {
            res.status(200).send(err)
        }
    });    
    
})

Router.put("/", (req, res)=>{
    if(!req.body.personID){
        res.status(200).send({"message": "Invalid request, personID is missing!", "status": 400})
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
        res.status(200).send({"message": "Invalid request, field is missing to update!", "status": 400})
        return
    }

    var update_sql = "UPDATE Persons SET "+setColumns+" WHERE Personid = "+req.body.personID;
    console.log(update_sql)
    mysqlConnection.query(update_sql, function (err, result) {
        if(!(err)){
            console.log(result)
            if(result.affectedRows>0){
                res.status(200).send({"message": "Success.", "status": 0})
            }
            else
            {
                res.status(200).send({"message": "Invalid personID!", "status": 400})
            }
            
        }
        else
        {
            res.status(200).send(err)
        }
    });    
    
})

module.exports = Router