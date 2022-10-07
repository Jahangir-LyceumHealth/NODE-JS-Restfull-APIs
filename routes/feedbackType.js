const express = require("express")
const Router = express.Router()
const mysqlConnection = require("../connection")
const currentVersion = 1


Router.get("/", (req, res)=>{
    //console.log(req.query)  //http://localhost:3000/api/hmp/feedbackType?appID=001fa13837a62d2805383a39fcdc3b0c&apiVersion=1
    //console.log(req.body)   //within body's json
    res.header("Access-Control-Allow-Origin", "*");
    if(!req.query.appID){
        res.status(200).send({"message": "Invalid request, appID is missing!", "status": 400})
        return
    }

    if(!req.query.apiVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is missing!", "status": 400})
        return
        
    }else if(parseInt(req.query.apiVersion) != currentVersion){
        res.status(200).send({"message": "Invalid request, apiVersion is wrong!", "status": 400})
        return        
    }

    if(req.query.appID && req.query.apiVersion){
        mysqlConnection.lyceum_emp_2.query("SELECT emp_application_info.*, emp_applications.application_id AS application_id FROM emp_application_info LEFT JOIN emp_applications ON emp_applications.pk = emp_application_info.fk_emp_application WHERE external_application_ID='"+req.query.appID+"' ", (err, rows, fields)=>{
            if(!(err)){
                console.log('lyceum_emp_2>>emp_application_info:')
                console.log(rows)

                //If Valid appID
                if(rows.length>0){
                    const req_APPID = parseInt(rows[0].application_id)
                    console.log('APPID:: '+rows[0].application_id)
                    //Only active i.e. status=1 will return data. 
                    //1=active, 2=Deleted
                    let select_sql = "SELECT FDTP.pk AS pk, FDTP.pk AS feedbackTypeID, FDTP.name AS feedbackTypeName, FDTP.description AS feedbackTypeDescription, FDTP.externalFeedbackTypeID AS externalFeedbackTypeID, FDTP.status AS status, FDTP.json_data AS jsonData FROM msp_feedback_type AS FDTP WHERE app_id="+req_APPID+" AND status = 1"
                    
                    //If body contain status param
                    if(req.query.status || req.query.status=='0')
                        select_sql = "SELECT * FROM msp_feedback_type WHERE app_id="+req_APPID+" AND status = "+parseInt(req.query.status)

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

    if(!req.body.feedbackTypeName.en){
        res.status(200).send({"message": "Invalid request, feedbackTypeName [en] is missing!", "status": 400})
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

                    let addColumns = 'app_id, status'
                    let addValues = "'" + req_APPID + "', 1"
                    let localizedContentRows = []
                    if(req.body.feedbackTypeName){
                        if(addColumns!='')
                            addColumns +=", "
                        if(addValues!='')
                            addValues +=", "

                        if(req.body.feedbackTypeName.en){
                            addColumns += "name"
                            addValues += "'" + req.body.feedbackTypeName.en + "'"
                            localizedContentRows.push({'language_pk': 1, 'object_type':26, 'content_title':req.body.feedbackTypeName.en, 'content_description':null})
                        }
                        if(req.body.feedbackTypeName.fr){
                            localizedContentRows.push({'language_pk': 2, 'object_type':26, 'content_title':req.body.feedbackTypeName.fr, 'content_description':null})
                        }
                    }
                    
                    if(req.body.feedbackTypeDescription){
                        if(addColumns!='')
                            addColumns +=", "
                        if(addValues!='')
                            addValues +=", "

                        if(req.body.feedbackTypeDescription.en){
                            addColumns += "description"
                            addValues += "'" + req.body.feedbackTypeDescription.en + "'"
                            let hasIndex = localizedContentRows.findIndex(singleOBJ => singleOBJ.language_pk=='1')
                            if (hasIndex > -1) {
                                localizedContentRows[hasIndex].content_description = req.body.feedbackTypeDescription.en
                            }else{
                                localizedContentRows.push({'language_pk': 1, 'object_type':26, 'content_title':null, 'content_description':req.body.feedbackTypeDescription.en})
                            }
                        }

                        if(req.body.feedbackTypeDescription.fr){
                            let hasIndex = localizedContentRows.findIndex(singleOBJ => singleOBJ.language_pk=='2')
                            if (hasIndex > -1) {
                                localizedContentRows[hasIndex].content_description = req.body.feedbackTypeDescription.en
                            }else{
                                localizedContentRows.push({'language_pk': 2, 'object_type':26, 'content_title':null, 'content_description':req.body.feedbackTypeDescription.fr})
                            }
                        }
                    }
                    console.log(addColumns)
                    console.log(addValues)
                    console.log(localizedContentRows)
                    
                    var insert_sql = "INSERT INTO msp_feedback_type ("+addColumns+") VALUES ("+addValues+")";    
                    console.log(insert_sql)
                    mysqlConnection.lyceum_msp_2.query(insert_sql, function (err, result) {
                        if(!(err)){
                            console.log(result)
                
                            //START TO HANDLE TO SET externalFeedbackTypeID AS THEIR CURRENT PK i.e. on creation externalFeedbackTypeID has to always as their pk 
                            localizedContentRows.forEach((element) => {
                                element.object_id = result.insertId
                            });
                            console.log('After adding new insertId as object_id in localizedContentRows:')
                            console.log(localizedContentRows)

                            let keys = Object.keys(localizedContentRows[0]);
                            let values = localizedContentRows.map( obj => keys.map( key => obj[key]));
                            console.log('keys N values:: ')
                            console.log(keys)
                            console.log(values)

                            var update_sql = "UPDATE msp_feedback_type SET externalFeedbackTypeID="+result.insertId+" WHERE pk = "+result.insertId;
                            console.log(update_sql)
                            mysqlConnection.lyceum_msp_2.query(update_sql, function (err, result) {
                                if(!(err)){
                                    console.log(result)
                                    if(result.affectedRows>0){
                                       //START TO HANDLE localized contents i.e. insert single/multiple row into msp_localized_content table 
                                       let sqlLocalizedContent = 'INSERT INTO msp_localized_content (' + keys.join(',') + ') VALUES ?';
                                       mysqlConnection.lyceum_msp_2.query(sqlLocalizedContent, [values], function (err, result) {
                                            if(!(err)){
                                                res.status(200).send({"message": "Success.", "status": 0})
                                            }
                                            else
                                            {
                                               //res.status(200).send({"message": "Invalid localized contents!", "status": 400})
                                               res.status(200).send(err)
                                            }
                                       })
                                       //END TO HANDLE localized contents i.e. insert single/multiple row into msp_localized_content table 
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
                            //END TO HANDLE TO SET externalFeedbackTypeID AS THEIR CURRENT PK i.e. on creation externalFeedbackTypeID has to always as their pk 
                            
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
                    let localizedContentRows = []
                    
                    if(req.body.feedbackTypeName?.en){
                        setColumns = "name = '" + req.body.feedbackTypeName.en + "'"                
                        localizedContentRows.push({'object_id':req.body.feedbackTypeID, 'language_pk': 1, 'object_type':26, 'content_title':req.body.feedbackTypeName.en, 'content_description':null})
                    }
                    if(req.body.feedbackTypeName?.fr){
                        localizedContentRows.push({'object_id':req.body.feedbackTypeID, 'language_pk': 2, 'object_type':26, 'content_title':req.body.feedbackTypeName.fr, 'content_description':null})
                    }                    
                    
                    if(req.body.feedbackTypeDescription?.en){
                        if(setColumns!='')
                            setColumns +=", "
                        setColumns += "description = '" + req.body.feedbackTypeDescription.en + "'"

                        let hasIndex = localizedContentRows.findIndex(singleOBJ => singleOBJ.language_pk=='1')
                        if (hasIndex > -1) {
                            localizedContentRows[hasIndex].content_description = req.body.feedbackTypeDescription.en
                        }else{
                            localizedContentRows.push({'object_id':req.body.feedbackTypeID, 'language_pk': 1, 'object_type':26, 'content_title':null, 'content_description':req.body.feedbackTypeDescription.en})
                        }
                    }

                    if(req.body.feedbackTypeDescription?.fr){
                        let hasIndex = localizedContentRows.findIndex(singleOBJ => singleOBJ.language_pk=='2')
                        if (hasIndex > -1) {
                            localizedContentRows[hasIndex].content_description = req.body.feedbackTypeDescription.en
                        }else{
                            localizedContentRows.push({'object_id':req.body.feedbackTypeID, 'language_pk': 2, 'object_type':26, 'content_title':null, 'content_description':req.body.feedbackTypeDescription.fr})
                        }
                    }

                    if(setColumns==''){
                        res.status(200).send({"message": "Invalid request, no field/data to update!", "status": 400})
                        return
                    }

                    var update_sql = "UPDATE msp_feedback_type SET "+setColumns+" WHERE pk = "+req.body.feedbackTypeID+" AND app_id='"+req_APPID+"' ";
                    console.log(update_sql)
                    console.log('localizedContentRows::')
                    console.log(localizedContentRows)
                    //res.status(200).send({"message": "Success.", "status": 0})
                    
                    mysqlConnection.lyceum_msp_2.query(update_sql, function (err, result) {
                        if(!(err)){
                            console.log(result)
                            if(result.affectedRows>0){
                                console.log(localizedContentRows)
                                //res.status(200).send({"message": "Success.", "status": 0})
                                let keys = Object.keys(localizedContentRows[0]);
                                let values = localizedContentRows.map( obj => keys.map( key => obj[key]));
                                console.log('keys N values:: ')
                                console.log(keys)
                                console.log(values)     

                                //START TO HANDLE localized contents i.e. insert single/multiple row into msp_localized_content table 
                                //let sqlLocalizedContent = 'INSERT IGNORE INTO msp_localized_content (' + keys.join(',') + ') VALUES ?';
                                //let sqlLocalizedContent = 'INSERT INTO msp_localized_content (' + keys.join(',') + ') VALUES ? ON DUPLICATE KEY UPDATE content_title=VALUES(content_title), content_description=VALUES(content_description)';
                                let sqlLocalizedContent = 'INSERT INTO msp_localized_content (' + keys.join(',') + ') VALUES ? ON DUPLICATE KEY UPDATE content_title=CASE WHEN VALUES(content_title) IS NOT NULL THEN VALUES(content_title) ELSE content_title END, content_description=CASE WHEN VALUES(content_description) IS NOT NULL THEN VALUES(content_description) ELSE content_description END;';

                                console.log(sqlLocalizedContent)
                                mysqlConnection.lyceum_msp_2.query(sqlLocalizedContent, [values], function (err, result) {
                                    if(!(err)){
                                        console.log(result)   
                                        res.status(200).send({"message": "Success.", "status": 0})
                                    }
                                    else
                                    {
                                        //res.status(200).send({"message": "Invalid localized contents!", "status": 400})
                                        res.status(200).send(err)
                                    }
                                })
                                //END TO HANDLE localized contents i.e. insert single/multiple row into msp_localized_content table                                                                 
                                
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
    
    
})


module.exports = Router