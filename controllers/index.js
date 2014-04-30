
var Account = projectRequire('/models/Account');
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
}