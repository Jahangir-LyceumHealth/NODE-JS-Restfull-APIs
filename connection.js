const mysql = require("mysql2")


//LOCAL
var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root2022",
    database: "lyceumhealth",
    multipleStatements: true
})

/*
//AWS
var mysqlConnection = mysql.createConnection({
    host: "node.cxpwioxnlzt2.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "nodeMySQL2022",
    database: "LyceumHealth",
    multipleStatements: true
})
*/

mysqlConnection.connect((err)=>{
    if(!(err)){
        console.log('Connected!')    
    }
    else
    {
        console.log('Failed')
    }
})

module.exports = mysqlConnection