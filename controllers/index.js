
var Account = projectRequire('/models/Account');
var Message = projectRequire('/models/Message');

/**
 *
 * @param app
 */
module.exports.set = function(app) {

    app.get('/', function(req, res) {
        res.type('text/plain');
        res.send('Hello world');
    });

    /**
     * Save a new account
     */
    app.post('/accounts', function(req, res) {

        var account = new Account(req.body.emailAddress, req.body.displayName, req.body.password);

        account.saveToDb(function(){
            res.statusCode = 200;
            res.json({'status': 'SUCCESS', 'code' : 200, data:'', message:''});
        });
    });

    /**
     * Post a new message
     *
     * UNIMPLEMENTED SECURITY: We should check that the authenticated user making this request is the
     * same principal as the sender ID (or that the authenticated user has permission to send on behalf
     * of that account.)
     */
    app.post('/message', function(req, res) {

        var message = new Message(req.body.senderId, req.body.recipientAddress, req.body.body);

        message.saveToDb(
            function(msg){
                res.json(201, {'status': 'SUCCESS', 'code' : 201, messageId : msg.messageId });
            },
            function(msg) {
                res.json(403, {'status': 'ERROR', error : "Invalid recipient", address : msg.recipientAddress });
            }
        );
    });

    /**
     * Request a list of message IDs for all undelivered messages for a given account ID.
     *
     * UNIMPLEMENTED SECURITY: We should check that the principal making this request has permission to read
     * the messages that are addressed to the specified recipient. Or, we should only allow the query if the
     * recipient ID in the request body matches that of the authenticated user making this request.
     */
    app.post('/unreadMessages', function(req, res) {
        connection.query('SELECT message_id FROM messages WHERE recipient_id = ? AND delivered_time IS NULL',
                         [req.body.accountId],
                         function(err, rows, fields) {
            if (err) {
                throw err;
            }

            if (rows.length == 0) {
                res.json(204, {'status':'SUCCESS'}); // No unread messages available for the given recipient
            } else {
                res.json(200, {'status':'SUCCESS', messages : rows, length : rows.length});
            }
        });
    });

    /**
     * Request a single message by messge ID and set it's delivery time to the current time.
     *
     * UNIMPLEMENTED SECURITY: We should check that the principal making this request has permission to read
     * the requested message ID. Or, we should only allow the query if the recipient ID in the request body
     * matches that of the authenticated user who is making this request.
     */
    app.post('/retrieveMessage', function(req, res) {
        connection.query('SELECT sender_id, sent_time, body FROM messages WHERE message_id = ?',
                         [req.body.messageId],
                         function(err, rows, fields) {
            if (err) {
                throw err;
            }

            if (rows.length == 0) {
                res.json(403, {'status':'ERROR', error : 'Invalid message ID', messageId : req.body.messageId });
            } else {
                connection.query('UPDATE messages SET delivered_time = NOW() WHERE message_id = ?',
                                 [req.body.messageId],
                                 function(err, result) {
                    if (err) {
                        throw err;
                    }
                    logger.debug("Delivery time has been set for message ID " + req.body.messageId);
                });
                res.json(200, {'status':'SUCCESS',
                               senderId : rows[0].sender_id,
                               sentTime : rows[0].sent_time,
                               body : rows[0].body });
            }
        });
    });
}
