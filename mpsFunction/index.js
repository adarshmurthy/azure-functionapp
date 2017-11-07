'use strict';

module.exports = function (context, eventHubMessages) {
    context.log('Node.js eventhub trigger function processed work item', eventHubMessages);    
    context.log('Message received and sent to MPS: ');  
    request.post({headers: {"Content-Type": "application/json"}, 
    url: mpsurl,
    body: JSON.stringify({"nargout":1, 
    "rhs": JSON.stringify(eventHubMessages), 
    "outputFormat" : { "mode" : "large", "nanInfFormat" : "string" },
    })
    }
    ,callback);
    
    context.done();
};

var EventHubClient = require('azure-event-hubs').Client;

function GetEnvironmentVariable(name)
{
	return process.env[name];
}

// Get Environment variable
var connectionString = getEnvironmentVariable("IoTHubReceiverConnectionString");
// How do you install packages from AZ CLI to ensure that these packages can work?
var request = require('request');
var azure = require('azure-storage');

var mpsurl = "http://IoTMPS-1723133731.us-east-1.elb.amazonaws.com:9910/beltConveyorConditionAdv/beltConveyorConditionAdv";
//var mpsurl = "http://52" 

var printError = function (err) {
  console.log(err.message);
};

function callback(error, response, body){
                if (!error && response.statusCode == 200){
                  console.log('In callback');
                  var parsedResult = JSON.parse(body)
                  console.log(JSON.stringify(body));
                  var mwdata = parsedResult.lhs[0].mwdata;
				  console.log(mwdata);

                  } else {
                    console.log(response)
                    console.log(error)
                  }
};
