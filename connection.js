const mysql = require("mysql2")

/*
//LOCAL
*/

//AWS
//Connection for database: lyceum_emp_2
var mysqlConnection_emp = mysql.createConnection({
    host: "node.cxpwioxnlzt2.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "nodeMySQL2022",
    database: "lyceum_emp_2",
    multipleStatements: true
})
mysqlConnection_emp.connect((err)=>{
    if(!(err)){
        console.log('Connected lyceum_emp_2')    
    }
    else
    {
        console.log('Failed to connect lyceum_emp_2!')
    }
})
/*
//Connection for database: lyceum_msp_2
var mysqlConnection_msp = mysql.createConnection({
    host: "node.cxpwioxnlzt2.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "nodeMySQL2022",
    database: "lyceum_msp_2",
    multipleStatements: true
})
mysqlConnection_msp.connect((err)=>{
    if(!(err)){
        console.log('Connected lyceum_msp_2')    
    }
    else
    {
        console.log('Failed to connect lyceum_msp_2!')
    }
})
*/

//module.exports = {'lyceum_msp_2':mysqlConnection_emp, 'lyceum_emp_2':mysqlConnection_emp}
//module.exports = mysqlConnection_msp
