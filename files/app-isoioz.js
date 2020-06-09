let util                                    = require("util");
let net                                     = require("net");
let rpio                                    = require('rpio');
let SerialPort                              = require("serialport");


let connected                               = false;
let input0                                  = 0;
let input1                                  = 0;
let relay0                                  = 'open';
let relay1                                  = 'open';

let server;
let x                                       = 0;
let y                                       = 0;

const   { exec }                            = require('child_process');
const   serverAddr                          = "192.168.10.102";
const   serverPort                          = 8000;
const   connectRetryAttemptTimeout          = 5000;



                            // GPIO
rpio.init({gpiomem: false});
rpio.open(33, rpio.INPUT);
rpio.open(35, rpio.OUTPUT, rpio.LOW);
rpio.open(36, rpio.INPUT);
rpio.open(38, rpio.OUTPUT, rpio.LOW);
                            // System LED
rpio.open(22, rpio.OUTPUT, rpio.LOW);


setInterval(function() {
    /*
    switch (x) {
        case 0:
            x                               = 1;
            rpio.write(35, rpio.HIGH);
            rpio.write(38, rpio.HIGH);
            break;

        case 1:
            x                               = 0;
            rpio.write(35, rpio.LOW);
            rpio.write(38, rpio.LOW);
            break;

        default:
            x                               = 0;
            break;
    }
    //*/
    //*
    if (rpio.read(33) == 0) {
        rpio.write(38, rpio.HIGH);
        input0                              = 0;
        relay0                              = 'closed';
    } else {
        rpio.write(38, rpio.LOW);
        input0                              = 1;
        relay0                              = 'open';
    }
    if (rpio.read(36) == 0) {
        rpio.write(35, rpio.HIGH);
        input1                              = 0;
        relay1                              = 'closed';
    } else {
        rpio.write(35, rpio.LOW);
        input1                              = 1;
        relay1                              = 'open';
    }
    //*/
}, 50);

setInterval(function() {
    if (connected) {
        server.write(JSON.stringify({ type: "data", data: { input0: input0, input1: input1, relay0: relay0, relay1: relay1 } }));
        rpio.write(22, rpio.HIGH);
    } else {
        rpio.write(22, rpio.LOW);
    }

    /*
    switch (y) {
        case 0:
            y                               = 1;
            rpio.write(22, rpio.HIGH);
            break;
        case 1:
            y                               = 0;
            rpio.write(22, rpio.LOW);
            break;
        default:
            break;
    }
    //*/
}, 200);



function openConnection() {
    server                                  = new net.Socket();
    server.setKeepAlive(true);

    server.on('close', function() {
        connected                           = false;
        setTimeout(openConnection, connectRetryAttemptTimeout);

        console.log("connection timeout...");
    });

    server.on('connect', function() {
        server.write(JSON.stringify({type: "connect"}));
        connected                           = true;
    });

    server.on('error', function(error) {
//        console.log("ERROR...  " + error.message);
    });

    server.connect(serverPort, serverAddr, function() {
        console.log("connected...");
    });
}
// setup the connection to the server
openConnection();


