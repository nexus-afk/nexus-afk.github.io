var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "katf6786_adminbot",
    password: ""
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});