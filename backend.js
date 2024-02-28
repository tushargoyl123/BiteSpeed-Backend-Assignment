const sql = require("mysql2");
const conn = sql.createConnection({
    host:"localhost",
    user:"root",
    password:"1234",
});
conn.connect(function(err){
    if(err) throw new Error(err);
    console.log("connected");
    
    runQuery(conn,"create database if not exists testing")
    console.log("Database Created");
    runQuery(conn,"use testing")
    console.log("Using Table");
    runQuery(conn,"create table if not exists testing (id INT)")
    console.log("Table Created");
});

function runQuery(conn,query){
    conn.query(query,function(err){
        if(err) throw new Error(err);
    })
}