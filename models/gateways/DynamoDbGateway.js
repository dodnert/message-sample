/**
 *
 * @type {*}
 * @private
 */
var _ = require('underscore');

/**
 * The AWS sdk
 * @type {*}
 */
var AWS = require('aws-sdk');
AWS.config.update(config.aws)

//Special setup  needed when running locally, will refractor out.
if(config.aws.runLocal) {
    var dynamoDb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });
}
else {
    var dynamoDb = new AWS.DynamoDB();
}



/**
 * Gateway for dynamo db
 * @param model
 * @constructor
 */
function DynamoDbGateway(model) {

    /**
     * The model we are providing gateway functionality for
     * @type {*}
     */
    this.model = model;
}


/**
 * Save our model to the db
 *
 * @param onSuccess
 */
DynamoDbGateway.prototype.saveToDb = function(onSuccess) {

    var items = {};
    for(field_name in this.model.table_fields) {
        var attributeType = this.model.table_fields[field_name].attributeType;
        var value = this.model[field_name];
        if(!value) {
            continue;
        }
        var entry = {};
        entry[attributeType] = value;
        items[field_name] = entry
    }

    dynamoDb.putItem({"TableName":this.model.table_name, "Item":items}, function(err, result){
        var ok = true;
        if(err) {
            ok = false;
            logger.error("Unable to save model", err); console.log(err);
        }
        if(onSuccess) {
            onSuccess(ok)
        }
    });
}



/**
 * Query dynamo db
 *
 * @param params
 * @param onSuccess
 */
DynamoDbGateway.prototype.query = function(params, onSuccess) {

    var that = this;

    dynamoDb.query(params, function(err, data) {
        var results = false;
        if (err) {
            logger.error("Unable to retrieve tracking events with error", err);  console.log(err);
        }
        else {
            logger.trace("Retrieved " + data.Count + " tracking events for params" + params);
            var formattedResults = [];
            data.Items.forEach(function(item){
                var model = Object.create(that.model);
                that.convertResultRowToModel(item, model);
                formattedResults.push(model);
            });
            results = formattedResults;
        }
        if(onSuccess) {
            onSuccess(results);
        }
    });
}


/**
 * Convert the results from a dynamo query or scan back to the model.
 *
 * @param result
 * @param model
 */
DynamoDbGateway.prototype.convertResultRowToModel = function(result, model) {

    var fieldNames = _.keys(model.table_fields);
    fieldNames.forEach(function(fieldName){
        var fieldType = model.table_fields[fieldName].attributeType;

        if(result[fieldName]) {
            var value = result[fieldName][fieldType];
            model[fieldName] = value;
        }
    });
}


/**
 * Get an item by id
 * @param params
 */
DynamoDbGateway.prototype.getItem = function(params, onSuccess) {

    var that = this;
    var model = Object.create(this.model);
    dynamoDb.getItem(params, function(err, data) {
        if (err) {
            logger.error("Unable to retrieve model by id", err);
            console.log(err);
            data = false;
        }
        if(onSuccess) {
            //Translate values into our return object
            for(i in that.model.table_fields) {
                //Expect return type
                var t = that.model.table_fields[i].attributeType
                model[i] = data.Item[i][t]; //AWS response always contains type in response.
            }
            onSuccess(model);
        }
    });
}

module.exports = DynamoDbGateway;