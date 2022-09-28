const mysql = require("mysql2")

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root2022",
    database: "lyceumhealth",
    multipleStatements: true
})

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