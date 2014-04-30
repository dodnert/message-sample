/**
 * Provides apple push notification services
 * @type {*}
 */
var apn = require('apn');

/**
 *
 * @type {*}
 */
var selectn = require('selectn');


var apnsGateway = (function () {

    /**
     * Singleton reference object
     */
    var instance;

    function init() {

        /**
         *
         * @type {apn.Connection}
         */
        var apnConnection = apnConnectionImpl ||  new apn.Connection({pfx: projBaseDir + '/certs/' + config.apnsCert,
            gateway: config.apnsGateway,/* gateway address */
            errorCallback: function(err,n){logger.error("APNS: Push error", err);},         /* Callback when error occurs function(err,notification) */
            cacheLength: 100
        });

        //Setup listeners for our apn connection
        apnConnection.on('connected', function() {
            logger.info("APN: Connected to server");
        });

        apnConnection.on('transmitted', function(notification, device) {
            logger.trace("Notification transmitted to:" + device.token.toString('hex'));
        });

        apnConnection.on('transmissionError', function(errCode, notification, device) {
            logger.info("Notification caused error: " + errCode + " for device ", device, notification);
        });

        apnConnection.on('timeout', function () {
            logger.error("Connection Timeout");
        });

        apnConnection.on('disconnected', function(e) {
            logger.info("Disconnected from APNS");
        });

        apnConnection.on('error', function(e) {
            logger.error("error from APNS", e);
        });


        /**
         * Send an ios push notification to apns for delivery
         * @param notificationId The device notification token
         * @param text The contents of the notification
         */
        function sendNotification(notificationId, text) {
            var note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.sound = 'default';

            note.alert = text;

            apnConnection.pushNotification(note, new apn.Device(notificationId));
        }

        return {
            sendNotification: sendNotification
        }
    };

    return {
        /**
         * Get the instance
         * @returns {*}
         */
        getInstance: function () {

            if ( !instance ) {
                instance = init();
            }

            return instance;
        }
    };
})();


module.exports = apnsGateway;
