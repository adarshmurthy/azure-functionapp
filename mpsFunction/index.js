'use strict';

module.exports = function (context, eventHubMessages) {
    context.log('Node.js eventhub trigger function processed work item', eventHubMessages);    
    context.log('Message received and sent to MPS: ');  
    request.post({headers: {"Content-Type": "application/json"}, 
    url: mpsurl,
    body: JSON.stringify({"nargout":4, 
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

// How do you assign storage account dynamically? - maybe we use the same name in the template as well, and how do we get the accessKey?
// GetEnvironmentVariable
var storageAccount = getEnvironmentVariable("StorageAccountName");
var accessKey = getEnvironmentVariable("StorageAccountKey");

// GetEnvironmentVariable
// How do we create a tablestorageAccount? and get the accesskey
// Can Storage account name and accesskey be used?
//var tablestorageAccount = 'mwconditionstorage';
//var tableaccessKey = 'JSoaMTTyeAflHuh3umsJGjCYeZO6QMSynYWeC0aGsEwMw4WiusvcWSXVX77Hk3OLzs+TOr99a2Tf/Fj8zqFFBQ==';

var blobSvc = azure.createBlobService(storageAccount, accessKey);
var tableSvc = azure.createTableService(storageAccount, accessKey);
var entGen = azure.TableUtilities.entityGenerator;

blobSvc.createContainerIfNotExists('conditionmonitoring', {publicAccessLevel: 'container'}, function(error, result, response){
  if(!error){
    // Container exists and is private
  } else {
    console.log(error);
  }
});

tableSvc.createTableIfNotExists('conditiontable', function(error, result, response){
  if(!error){
    console.log(response);
    console.log(result);
  } else {
    console.log(error);
  }
});

var mpsurl = "http://IoTMPS-1723133731.us-east-1.elb.amazonaws.com:9910/beltConveyorConditionAdv/beltConveyorConditionAdv";
//var mpsurl = "http://52" 

var printError = function (err) {
  console.log(err.message);
};


function callback(error, response, body){
                if (!error && response.statusCode == 200){
                  console.log('In callback');
                  var parsedResult = JSON.parse(body)
                  //console.log(JSON.stringify(body));
                  var mwdata = parsedResult.lhs[0].mwdata;
                  var statusdata = parsedResult.lhs[1].mwdata;
                  var deviceData = parsedResult.lhs[2].mwdata;
                  var requestData = parsedResult.lhs[3].mwdata;
                  //console.log(JSON.stringify(mwdata));
                  //console.log(JSON.stringify(statusdata));

                  var binaryData = new Buffer(mwdata, 'base64');
                  blobSvc.createBlockBlobFromText('conditionmonitoring',
                  'testImage'.concat(deviceData[0]).concat('.jpg'),
                  binaryData,
                  {ContentType:'image/jpeg'},
                  function(error, result, response) {
                  if (error) {
                    console.log(error);
                  }
                  console.log('Image write complete');
                  //console.log("result", result);
                  //console.log("response", response);
                  });

                  console.log(deviceData);
                  console.log(statusdata);
                  
                  //console.log(mwdata);
                  //console.log(statusdata);
                  
                  var rowKey = new Date().getTime().toString();  
                  //var rowKey = DateTime.MaxValue.Ticks - DateTime.UtcNow.Ticks;                  
                  console.log(rowKey)
                  var task = {
                    PartitionKey: {'_': deviceData[0]},
                    RowKey: {'_': rowKey},
                    RawData: {'_': requestData[0]},
                    MPSResult: {'_': mwdata[0]},
                    Status: {'_': statusdata[0]},
                    dueDate: {'_':new Date(2015, 6, 20), '$':'Edm.DateTime'}
                  };

                  tableSvc.insertEntity('conditiontable',task, function (error, result, response) {
                  if(!error){
                      console.log(JSON.stringify(result));
                   } else {
                      console.log(JSON.stringify(response));
                   }
                  });
                  

                  } else {
                    console.log(response)
                    console.log(error)
                  }
};
