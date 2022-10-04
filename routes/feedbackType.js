const express = require("express")
const Router = express.Router()
const mysqlConnection = require("../connection")
const currentVersion = 1


Router.get("/", (req, res)=>{
    if(!req.body.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.body.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
        
    }else if(parseInt(req.body.apiVersion) != currentVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is wrong!", "status": 400})
        return        
    }

    if(req.body.appID && req.body.apiVersion){
        mysqlConnection.lyceum_emp_2.query("SELECT emp_application_info.*, emp_applications.application_id AS application_id FROM emp_application_info LEFT JOIN emp_applications ON emp_applications.pk = emp_application_info.fk_emp_application WHERE external_application_ID='"+req.body.appID+"' ", (err, rows, fields)=>{
            if(!(err)){
                console.log('lyceum_emp_2>>emp_application_info:')
                console.log(rows)

                //If Valid appID
                if(rows.length>0){
                    const req_APPID = parseInt(rows[0].application_id)
                    console.log('APPID:: '+rows[0].application_id)
                    //Only active i.e. status=1 will return data. 
                    //1=active, 2=Deleted
                    let select_sql = "SELECT * FROM msp_feedback_type WHERE app_id="+req_APPID+" AND status = 1"
                    
                    //If body contain status param
                    if(req.body.status || req.body.status=='0')
                        select_sql = "SELECT * FROM msp_feedback_type WHERE app_id="+req_APPID+" AND status = "+parseInt(req.body.status)

                    mysqlConnection.lyceum_msp_2.query(select_sql, (err, rows, fields)=>{
                        if(!(err)){
                            res.status(200).send(rows)
                        }
                        else
                        {
                            //console.log(err)
                            res.status(200).send({"message": "Empty records!", "status": 300})
                        }
                    })
    
                //Invalid appID
                }else{
                    res.status(200).send({"message": "Invalid request, appID is Invalid!", "status": 400})
                    return
                } 
            }
        })
    }
})


Router.post("/", (req, res)=>{    
    if(!req.body.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.body.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
        
    }else if(parseInt(req.body.apiVersion) != currentVersion){
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

    if(req.body.appID && req.body.apiVersion){
        mysqlConnection.lyceum_emp_2.query("SELECT emp_application_info.*, emp_applications.application_id AS application_id FROM emp_application_info LEFT JOIN emp_applications ON emp_applications.pk = emp_application_info.fk_emp_application WHERE external_application_ID='"+req.body.appID+"' ", (err, rows, fields)=>{
            if(!(err)){
                console.log('lyceum_emp_2>>emp_application_info:')
                console.log(rows)

                //If Valid appID
                if(rows.length>0){
                    const req_APPID = parseInt(rows[0].application_id)
                    console.log('APPID:: '+rows[0].application_id)

                    var insert_sql = "INSERT INTO msp_feedback_type (name, description, app_id, status) VALUES ('"+req.body.feedbackTypeName+"', '"+req.body.feedbackTypeDescription+"', "+req_APPID+", 1)";
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

                //Invalid appID
                }else{
                    res.status(200).send({"message": "Invalid request, appID is Invalid!", "status": 400})
                    return
                }                  

            }
            else
            {
                res.status(200).send(err)
                return
            }
        })
    }

    
    
})


Router.delete("/", (req, res)=>{
    if(!req.body.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.body.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
        
    }else if(parseInt(req.body.apiVersion) != currentVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return        
    }

    if(!req.body.feedbackTypeID){
        res.status(200).send({"message": "Invalid request, feedbackTypeID is missing!", "status": 400})
        return
    }

    if(req.body.appID && req.body.apiVersion){
        mysqlConnection.lyceum_emp_2.query("SELECT emp_application_info.*, emp_applications.application_id AS application_id FROM emp_application_info LEFT JOIN emp_applications ON emp_applications.pk = emp_application_info.fk_emp_application WHERE external_application_ID='"+req.body.appID+"' ", (err, rows, fields)=>{
            if(!(err)){
                console.log('lyceum_emp_2>>emp_application_info:')
                console.log(rows)

                //If Valid appID
                if(rows.length>0){
                    const req_APPID = parseInt(rows[0].application_id)
                    console.log('APPID:: '+rows[0].application_id)
                    
                    //var delete_sql = "DELETE FROM msp_feedback_type WHERE pk = "+req.body.feedbackTypeID+" AND app_id='"+req_APPID+"' ";
                    //var delete_sql = "DELETE FROM msp_feedback_type WHERE pk = "+req.body.feedbackTypeID;
                    //var delete_sql = "UPDATE msp_feedback_type SET status=2 WHERE pk = "+req.body.feedbackTypeID;
                    var delete_sql = "UPDATE msp_feedback_type SET status=2 WHERE pk = "+req.body.feedbackTypeID+" AND app_id='"+req_APPID+"' ";
                    console.log(delete_sql)
                    mysqlConnection.lyceum_msp_2.query(delete_sql, function (err, result) {
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


                //Invalid appID
                }else{
                    res.status(200).send({"message": "Invalid request, appID is Invalid!", "status": 400})
                    return
                }                  

            }   
            else
            {
                res.status(200).send(err)
                return
            }
        })
    }    
})


Router.put("/", (req, res)=>{
    if(!req.body.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.body.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
        
    }else if(parseInt(req.body.apiVersion) != currentVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return        
    }

    if(!req.body.feedbackTypeID){
        res.status(200).send({"message": "Invalid request, feedbackTypeID is missing!", "status": 400})
        return
    }

    if(req.body.appID && req.body.apiVersion){
        mysqlConnection.lyceum_emp_2.query("SELECT emp_application_info.*, emp_applications.application_id AS application_id FROM emp_application_info LEFT JOIN emp_applications ON emp_applications.pk = emp_application_info.fk_emp_application WHERE external_application_ID='"+req.body.appID+"' ", (err, rows, fields)=>{
            if(!(err)){
                console.log('lyceum_emp_2>>emp_application_info:')
                console.log(rows)

                //If Valid appID
                if(rows.length>0){
                    const req_APPID = parseInt(rows[0].application_id)
                    console.log('APPID:: '+rows[0].application_id)
                    
                    let setColumns = ''
                    if(req.body.feedbackTypeName){
                        setColumns = "name = '" + req.body.feedbackTypeName + "'"
                    }
                    
                    if(req.body.feedbackTypeDescription){
                        if(setColumns!='')
                            setColumns +=", "
                        setColumns += "description = '" + req.body.feedbackTypeDescription + "'"
                    }
                                    
                    if(setColumns==''){
                        res.status(200).send({"message": "Invalid request, field is missing to update!", "status": 400})
                        return
                    }

                    var update_sql = "UPDATE msp_feedback_type SET "+setColumns+" WHERE pk = "+req.body.feedbackTypeID+" AND app_id='"+req_APPID+"' ";
                    console.log(update_sql)
                    mysqlConnection.lyceum_msp_2.query(update_sql, function (err, result) {
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


                //Invalid appID
                }
                else
                {
                    res.status(200).send({"message": "Invalid request, appID is Invalid!", "status": 400})
                    return
                }                  

            }   
            else
            {
                res.status(200).send(err)
                return
            }
        })
    } 






    /*
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
    */
    
})

module.exports = Router