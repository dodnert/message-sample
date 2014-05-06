/**
 * A simple message object
 *
 * @param senderId - sender's account ID
 * @param recipientAddress - recipient's address
 * @param body - the message body
 * @constructor
 */
function Message(senderId, recipientAddress, body)
{
    /**
     * PK from db
     * @type {string}
     */
    this.messageId = '';

    /**
     *
     * @type {*}
     */
    this.senderId = senderId;

    /**
     *
     * @type {*}
     */
    this.recipientAddress = recipientAddress;

    /**
     *
     * @type {*}
     */
    this.body = body;
}

Message.prototype.saveToDb = function(onSuccess, onInvalidRecipient) {
    var that = this;

    connection.query('SELECT account_id FROM accounts WHERE email_address = ?',
                     [this.recipientAddress],
                     function(err, rows, fields) {
        if (err) throw err;

        if (rows.length == 0) {
            if (onInvalidRecipient) {
                onInvalidRecipient(that);
            }
            return;
        }

        var data = {sender_id : that.senderId, recipient_id : rows[0].account_id, body : that.body};

        connection.query('INSERT INTO messages SET ?', data, function(err, result) {
            if (err) throw err;

            that.messageId = result.insertId;
            logger.debug("A new message has been posted. ID = " + result.insertId);
            if (onSuccess) {
                onSuccess(that);
            }
        });
    });

} 

module.exports = Message;
