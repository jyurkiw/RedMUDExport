/**
 * Export function for node command line execution.
 * Takes a single argument: The filename to write to.
 * Usage: npm start -- <filename>
 * 
 * @namespace cli
 */
function exportAll() {
    var filename = process.argv[2];

    if (filename !== null) {
        var lib = require('redmudlib')();
        var rex = require('./export-lib')(lib);

        rex.file.exportAsync(filename)
            .then(function() {
                console.log("Export successfully written to " + filename);
                lib.client.instance().quit();
            })
            .catch(function(err) {
                console.log(err);
                lib.client.instance().quit();
            });
    }
}

exportAll();