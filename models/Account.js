/**
 * A basic account object
 *
 * @param emailAddress
 * @param displayName
 * @param password
 * @constructor
 */
function Account(emailAddress, displayName, password)
{
    /**
     * PK from db
     * @type {string}
     */
    this.accountId = '';

    /**
     *
     * @type {*}
     */
    this.emailAddress = emailAddress;

    /**
     *
     * @type {*}
     */
    this.displayName = displayName;

    /**
     *
     * @type {*}
     */
    this.password = password;


}

Account.prototype.saveToDb = function(onSuccess) {

    var that = this;
    var data = {email_address : this.emailAddress, display_name: this.displayName, password : this.password};
    connection.query('INSERT INTO accounts SET ?', data, function(err, result) {
        if (err) throw err;

        that.accountId = result.insertId;
        if(onSuccess) {
            onSuccess(that);
        }
    });
}

module.exports = Account;