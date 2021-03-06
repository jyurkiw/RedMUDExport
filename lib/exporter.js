/**
 * The RedMud Exporter.
 * 
 * @namespace Exporter
 * @param {object} lib A RedMUDLib object.
 * @returns A RedMUDExporter.
 */
function RedMUDExporter(lib) {
    var templateUtil = require('./template-util').templateUtil;

    /**
     * Query the DB and build a basic data object for export or output.
     * 
     * @namespace Exporter
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

                return lib.area.async.getAreas()
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
            })
            .then(function(outputData) {
                return new Promise(function(resolve, reject) {
                    // Build rooms data
                    var roomTasks = [];
                    var rooms = {};

                    for (var areacode in outputData.data.areas) {
                        var area = outputData.data.areas[areacode];

                        if (area.size > 0) {
                            outputData.data.rooms[areacode] = [];
                        }

                        for (var rIdx = 1; rIdx <= area.size; rIdx++) {
                            roomTasks.push(lib.room.async.getRoom(area.areacode, rIdx));
                        }
                    }

                    return Promise.all(roomTasks)
                        .then(function(rooms) {
                            for (var roomIdx in rooms) {
                                var room = rooms[roomIdx];

                                outputData.data.rooms[room.areacode].push(room);
                            }
                            resolve(outputData);
                        });

                });
            })
            .then(function(outputData) {
                // Get all users and add to users[] array.
                return new Promise(function(resolve, reject) {
                    lib.user.async.getUsers()
                        .then(function(usernames) {
                            var userTasks = [];
                            usernames.forEach(function(username) {
                                userTasks.push(lib.user.async.getUser(username));
                            });

                            Promise.all(userTasks)
                                .then(function(users) {
                                    outputData.data.users = outputData.data.users.concat(users);
                                    resolve(outputData);
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        });
                });
            })
            .then(function(outputData) {
                return new Promise(function(resolve, reject) {
                    lib.character.async.getCharacters()
                        .then(function(characternames) {
                            var characterTasks = [];
                            characternames.forEach(function(charactername) {
                                characterTasks.push(lib.character.async.getCharacter(charactername));
                            });

                            Promise.all(characterTasks)
                                .then(function(characters) {
                                    outputData.data.characters = outputData.data.characters.concat(characters);
                                    resolve(outputData);
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        });
                });
            });
    }

    /**
     * Export the contents of the DB to the passed filename.
     * 
     * @namespace Exporter
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