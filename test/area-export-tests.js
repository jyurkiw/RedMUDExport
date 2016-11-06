var chai = require('chai');
var expect = chai.expect;
var assert = require('assert');

var redis = require('redis');
//var constants = require('../lib/constants');

var client = redis.createClient();

var lib = require('redmudlib')(client);
var rex = require('../export-lib')(lib);

var koboldValleyArea = {
    areacode: "KDV",
    name: "Kobold Valley",
    description: "A valley filled with dangerous Kobolds.",
    size: 0
};

var goblinCaveArea = {
    areacode: "GCV",
    name: "Goblin Cave",
    description: "A cave filled with goblins.",
    size: 0
};

var goblinCaveNoSize = {
    areacode: "GCV",
    name: "Goblin Cave",
    description: "A cave filled with goblins."
};

var koboldValleyUpdate = {
    name: "Kobold Death Valley",
    description: "A hot, dry valley filled with undead Kobolds."
};

var koboldAreaUpdated = {
    areacode: "KDV",
    name: "Kobold Death Valley",
    description: "A hot, dry valley filled with undead Kobolds.",
    size: 0
};

var objExportTemplate = {
    areas: {},
    rooms: {}
};

//Tests
describe('Basic area exporting', function() {
    // Setup
    beforeEach(function(done) {
        client.flushall();
        done();
    });

    after(function(done) {
        client.flushall();
        done();
    });

    describe('Single Area testing', function() {
        var areaTestObj = null;

        beforeEach(function() {
            areaTestObj = Object.assign({}, objExportTemplate);
            areaTestObj.areas[koboldValleyArea.areacode.toString()] = Object.assign({}, koboldValleyArea);

            return Promise.all([
                lib.area.async.createArea(koboldValleyArea.areacode, koboldValleyArea)
            ]);
        });

        it('Export a single area to an object.', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.a('object');
                    expect(output.data).is.deep.equal(areaTestObj);
                });
        });
    });

    describe('Multi Area testing', function() {
        var areaTestObj = null;

        beforeEach(function() {
            areaTestObj = Object.assign({}, objExportTemplate);
            areaTestObj.areas[koboldValleyArea.areacode.toString()] = Object.assign({}, koboldValleyArea);
            areaTestObj.areas[goblinCaveArea.areacode.toString()] = Object.assign({}, goblinCaveArea);

            return Promise.all([
                lib.area.async.createArea(koboldValleyArea.areacode, koboldValleyArea),
                lib.area.async.createArea(goblinCaveArea.areacode, goblinCaveArea)
            ]);
        });

        it('Export a single area to an object.', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.a('object');
                    expect(output.data).is.deep.equal(areaTestObj);
                });
        });
    });
});