/**
 * The RedMud Exporter.
 * 
 * @param {object} lib A RedMUDLib object.
 * @returns A RedMUDExporter.
 */
function RedMUDExporter(lib) {
    var templateUtil = require('./template-util').templateUtil;

    /**
     * Query the DB and build a basic data object for export or output.
     * 
     * @returns The builder promise. Resolves an outputObject.
     */
    function buildDataObject() {
        return new Promise(function(resolve, reject) {
            var data = templateUtil.baseOutputTemplate();
            var outputObj = {
                data: data
            };

            // Build areas data
            var areasList = null;

            lib.area.async.getAreas()
                .then(function(areas) {
                    areasList = areas;
                })
                .then(function() {
                    // Loop through the areasList and add all areas to the areas output block under their areacodes.
                    var areasTasks = [];

                    for (var idx in areasList) {
                        var areacode = areasList[idx];

                        areasTasks.push(lib.area.async.getArea(areacode));
                    }

                    return Promise.all(areasTasks)
                        .then(function(values) {
                            for (var areaIdx in values) {
                                var area = values[areaIdx];
                                data.areas[area.areacode] = area;
                            }
                        });
                })
                .then(function() {
                    resolve(outputObj);
                });
        });
    }

    /**
     * Export the contents of the DB to the passed filename.
     * 
     * @param {string} filename The file to export to.
     * @returns A promise that resolves to True if successful, and an error message otherwise.
     */
    function writeDataObjectToFile(filename) {
        return new Promise(function(resolve, reject) {
            var fs = require('fs');

            buildDataObject()
                .then(function(data) {
                    fs.writeFile(filename, JSON.stringify(data),
                        function(err) {
                            if (err !== null) {
                                reject(err);
                            } else {
                                resolve(true);
                            }
                        });
                });
        });
    }

    return {
        object: {
            exportAsync: buildDataObject
        },
        file: {
            exportAsync: writeDataObjectToFile
        }
    };
}

module.exports = RedMUDExporter;