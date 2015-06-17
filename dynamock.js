/*
 * Dynamock is a script which starts local DynamoDB instance,
 * creates tables specified in CloudFormation stack format,
 * and preloads data.
 *
 * Running dynamock:
 *   npm install dynalite
 *   npm install aws-sdk
 *   node dynamock.js <path/to/dynamodb.json> <path/to/fixtures.json>
 *
 * Author: Rustam Aliyev <rustam@flavery.com>
 */

console.log('Starting dynalite...');

var AWS = require('aws-sdk');
var CAPACITY = 20;
var PORT = 8000;

// Returns a standard Node.js HTTP server
var dynalite = require('dynalite'),
    dynaliteServer = dynalite({port: PORT, createTableMs: 1})

// Start server
dynaliteServer.listen(PORT, function(err) {
    if (err) throw err
    console.log('Dynalite started on port ' + PORT)
    console.log('Creating tables...');

    AWS.config.update({
        endpoint: 'http://127.0.0.1:'+PORT,
        region: 'us-west-1',
        accessKeyId: 'akid',
        secretAccessKey: 'secret'
    });

    var dynamodb = new AWS.DynamoDB();

    console.log("Creating database schema from CloudFormation stack and loading fixtures...");
    var tables = require(process.argv[2]);
    var fixtures = require(process.argv[3]);

    for (var resourceName in tables.Resources) {
        table = tables.Resources[resourceName].Properties;

        // update capacity units
        table.ProvisionedThroughput.ReadCapacityUnits = CAPACITY;
        table.ProvisionedThroughput.WriteCapacityUnits = CAPACITY;

        if (table.hasOwnProperty("GlobalSecondaryIndexes")) {
            table.GlobalSecondaryIndexes.forEach(function(si) {
                si.ProvisionedThroughput.ReadCapacityUnits = CAPACITY;
                si.ProvisionedThroughput.WriteCapacityUnits = CAPACITY;
            });
        }

        dynamodb.createTable(table, function(err, data) {
            if (err) throw err
            var tableName = data.TableDescription.TableName;
            console.log("Table " + tableName + " created");

            // Load fixtures data into table if any
            if (fixtures.hasOwnProperty(tableName)) {
                console.log("Loading fixtures into " + tableName + " table");
                fixtures[tableName].forEach(function(record) {
                    dynamodb.putItem({"TableName": tableName, "Item": record}, function(err, data) {
                        if (err) throw err
                    });
                });
            }
        });
    }

});