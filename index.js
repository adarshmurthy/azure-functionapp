'use strict';
global.result = 0;
module.exports = function (context, eventHubMessages) {
    context.log('Node.js eventhub trigger function processed work item', eventHubMessages);    
    context.log('Message received and sent to MPS: ');  
    context.log(JSON.stringify(eventHubMessages));
    request.post({headers: {"Content-Type": "application/json"}, 
    url: mpsurl,
    body: JSON.stringify({"nargout":1, 
    "rhs": JSON.stringify(eventHubMessages), 
    "outputFormat" : { "mode" : "large", "nanInfFormat" : "string" },
    })
    }
    ,callback);
    
    context.log('Result of compute:');
    context.log(global.result);
    context.done();
};

var EventHubClient = require('azure-event-hubs').Client;

// Get Environment variable
 //var connectionString = getEnvironmentVariable("IoTHubReceiverConnectionString");
var connectionString = 'Endpoint=sb://iothub-ns-mwiothubte-256617-24c5365670.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=9oEjpfAooqs+O1b25X0UmpzBRy7y+3wQYsz7Myb3iF4=';
// How do you install packages from AZ CLI to ensure that these packages can work?
var request = require('request');
var azure = require('azure-storage');

var mpsurl = "http://IoTMPS-1723133731.us-east-1.elb.amazonaws.com:9910/dewPointCalculator/dewPointCalculator";
//var mpsurl = "http://52" 

var printError = function (err) {
  console.log(err.message);
};

function callback(error, response, body){
                if (!error && response.statusCode == 200){
                  //context.log('In callback');
                  var parsedResult = JSON.parse(body)
                  //context.log(JSON.stringify(body));
                  var mwdata = parsedResult.lhs[0].mwdata;
                  global.result = mwdata;
				          //context.log(mwdata);

                  } else {
                    context.log(response)
                    context.log(error)
                  }
};

function GetEnvironmentVariable(name)
{
	return process.env[name];
};