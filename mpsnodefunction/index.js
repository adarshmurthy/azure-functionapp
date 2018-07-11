'use strict';

var EventHubClient = require('azure-event-hubs').Client;
var request = require('request');
var azure = require('azure-storage');

// Variable to store and use 'context' for logging
global.context = 0;
// Specify MPS url (worker or load balancer)
var mpsurl = "http://54.162.175.233:9910/dewPointCalculator/dewPointCalculator";

module.exports = function (context, eventHubMessages) {
    //Display the input message
    context.log('Node.js eventhub trigger function processed work item', eventHubMessages);
    //Store context variable for use in other functions
    global.context = context;
    //Send request to MPS to compute dewPoint
    request.post({headers: {"Content-Type": "application/json"}, 
    url: mpsurl,
    body: JSON.stringify({"nargout":1, 
    "rhs": JSON.stringify(eventHubMessages), 
    "outputFormat" : { "mode" : "large", "nanInfFormat" : "string" },
    })
    },callback);
    //Close the context
    context.done();
};

function callback(error, response, body){
    if (!error && response.statusCode == 200){        
        //Parse the MPS response
        var parsedResult = JSON.parse(body);
        //Extract the value of interest
        var mwdata = parsedResult.lhs[0].mwdata;
        //Display the result to the log  
        global.myVar.log('Dew Point:', mwdata);
        } else {
        global.myVar.log(response)
        global.myVar.log(error)
        }
};
