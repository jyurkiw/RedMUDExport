/**
 * An export tool for RedMUD.
 * Exports the contents of a RedMUD Redis server.
 * 
 * @param {any} mudlib A mud-lib object.
 */
function RedMUDExport(mudlib) {
    var libs = [];
    libs.push(require('./lib/exporter')(mudlib));
    libs.push(require('./lib/template-util'));

    var exLib = {};

    for (var i = 0; i < libs.length; i++) {
        var lib = libs[i];

        for (var libHeader in lib) {
            exLib[libHeader] = lib[libHeader];
        }
    }

    return exLib;
}

module.exports = RedMUDExport;