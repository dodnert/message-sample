/**
 * The express framework
 * @type {*}
 */
var express = require('express');

//Helper object for project requires
var projectRequire = require('./projectRequire.js');

/**
 *
 * @type {*}
 */
var mysql = require('mysql');

/**
 * Our logger
 * @type {*}
 */
var winston = require('winston');
GLOBAL.logger = winston;

var logConfig = {
    'levels': {
        'detail': 0,'trace': 1,'debug': 2, 'enter': 3,
        'info': 4,'warn': 5, 'error': 6
    },
    'colors': {
        'detail': 'grey','trace': 'grey','debug': 'blue','enter': 'inverse',
        'info': 'green','warn': 'yellow', 'error': 'red'
    }
};

//Global config object
var config = projectRequire('/config.js');
GLOBAL.config = config;

logger = new (winston.Logger)({
    'transports': [
        new (winston.transports.Console)(
            {
                'level': config.logLevel,
                'colorize': true,
                'timestamp' : true
            }),
        new (winston.transports.File)(
            {
                'level' : config.logLevel,
                'filename': 'var.log',
                json: false,
                'timestamp' : true
            })]
});

logger.setLevels(logConfig.levels);
winston.addColors(logConfig.colors);


//Setup our db
GLOBAL.connection = mysql.createConnection(config.db);

//Bootstrap express and all necessary controllers
var app = express();
var controllers = require('./controllers/index.js');

//Setup middleware
app.use(express.json());
app.use(express.urlencoded());

//All routing defined in here
controllers.set(app);

var port = process.env.PORT || 4044;
app.listen(port);

logger.debug("Listening on port: " + port);


process.on('exit', function(code) {
    logger.error("Exit Being Called", code)
});