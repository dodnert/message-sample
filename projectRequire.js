/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 3/27/14
 * Time: 11:00 PM
 * To change this template use File | Settings | File Templates.
 */

var projectDir = __dirname;

module.exports = GLOBAL.projectRequire = function(module) {
    return require(projectDir + module);
}


GLOBAL.projBaseDir = projectDir;
