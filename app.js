/**
 *  @file
 *  FCA Demo application - main screen
 *
 *  This module provides a template back-end server process for a browser based web-app
 *
 *  NOTE:  Don't forget to load alamods/comm and run 'npm install' also
 *
 */
let app                                     = require("express")();
let http                                    = require("http").Server(app);
let net                                     = require("net");
let io                                      = require("socket.io")(http);
let dgram                                   = require('dgram');
let os                                      = require('os').networkInterfaces();
let fs                                      = require('fs');
let ejs =require('ejs');



const WEB_PORT                              = 4444;


// database stuff
var mysql = require('mysql'); 
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "mydb"
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
    
  });




// --------------------------------------------------------------------------------------------------------------------
// CLIENT WEBSOCKET SERVER
// --------------------------------------------------------------------------------------------------------------------
// respond to "/" requests with the index file
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});
// respond to file requests
app.get(/^(.+)$/, function(request, response) {

console.log(request)

    response.sendFile(__dirname + request.params[0]);
});


io.on('connection', function(socket) {
    // wait for messages from the client on the "template" channel
    console.log('socket connection...');

    socket.on('template', function (data) {
        try {
            let msg= JSON.parse(data);

            switch (msg.type) {
                
                case 'viewbutton':
                    console.log("Well the button works");
                        // sends something over to the websocket
                        

                    con.query("SELECT * FROM customers", function (err, result) {
                        if (err) throw err;
                        else{
                            console.log("the database has been parsed")

                            io.emit('template', JSON.stringify({ type: 'dbResponse', data: result }));
                        }
                    
                    });
                    break;
                case 'button':
                    // console.log("doing SQL stuff!");
                //    table already created
                        sql = "INSERT INTO customers (name, address) VALUES ('Black Jesus', 'Angel St. 12287')";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                                console.log("1 record inserted");
                            });
                        
                      
                    break;
                case 'connect':
                    // io.emit('template', JSON.stringify({ type: 'cack' }));
                    // console.log(msg);
                    break;
                default:
                    break;
            }
        } catch (ex) {  }
    });
    socket.on('error', function(error) {
        console.log(error.message);
    });
    socket.on('disconnect', function(reason) {
        console.log(reason);
    });
});


//create the server for browser access

http.listen(WEB_PORT, function() {
    console.log("httpd listening on port 4444...");
});
