var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var assert = require('assert');

var redis = require('redis');
//var constants = require('../lib/constants');

var client = redis.createClient();

var lib = require('redmudlib')();
var rex = require('../export-lib')(lib);

var koboldValleyArea = {
    areacode: "KDV",
    name: "Kobold Valley",
    description: "A valley filled with dangerous Kobolds.",
    size: 0
};

var goblinValleyArea = {
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

var westernOverlook = {
    areacode: koboldValleyArea.areacode,
    roomnumber: 1,
    name: 'Western Overlook',
    description: 'A short cliff overlooks a small, fertile valley. You can see scores of Kobolds milling about doing whatever it is Kobolds do.'
};

var goblinCaveEntrance = {
    areacode: goblinValleyArea.areacode,
    roomnumber: 1,
    name: 'Cave Entrance',
    description: 'The opening to this dank cave reeks of Goblin.'
};

var goblinCaveTunnel = {
    areacode: goblinValleyArea.areacode,
    roomnumber: 2,
    name: 'Narrow Corridor',
    description: 'The cave stretches on into the darkness. '
};

//Tests
describe('Basic area exporting', function() {
    // Setup
    beforeEach(function() {
        return client.flushallAsync()
            .then(function() {
                return Promise.all([
                    lib.area.async.createArea(koboldValleyArea.areacode, koboldValleyArea),
                    lib.area.async.createArea(goblinValleyArea.areacode, goblinValleyArea)
                ]);
            });
    });

    after(function() {
        client.flushallAsync();
    });

    describe('Single Area testing', function() {
        var roomTestObj = null;

        beforeEach(function() {
            roomTestObj = { areas: {}, rooms: {} }
            roomTestObj.areas[koboldValleyArea.areacode.toString()] = Object.assign({}, koboldValleyArea);
            roomTestObj.areas[goblinValleyArea.areacode.toString()] = Object.assign({}, goblinValleyArea);
            roomTestObj.rooms[koboldValleyArea.areacode] = [westernOverlook];

            return Promise.all([
                lib.room.async.addRoom(westernOverlook.areacode, westernOverlook)
            ]);
        });

        it('Export a single room to an object.', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.a('object');
                    output.data.rooms.should.deep.equal(roomTestObj.rooms);
                });
        });
    });

    describe('Multi Area testing', function() {
        var roomTestObj = null;

        beforeEach(function() {
            roomTestObj = { areas: {}, rooms: {} }
            roomTestObj.areas[koboldValleyArea.areacode] = Object.assign({}, koboldValleyArea);
            roomTestObj.areas[goblinValleyArea.areacode] = Object.assign({}, goblinValleyArea);
            roomTestObj.rooms[goblinValleyArea.areacode] = [goblinCaveEntrance, goblinCaveTunnel];

            return Promise.all([
                lib.room.async.addRoom(goblinValleyArea.areacode, goblinCaveEntrance),
                lib.room.async.addRoom(goblinValleyArea.areacode, goblinCaveTunnel)
            ]);
        });

        it('Export multiple rooms to an object.', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.a('object');
                    expect(output.data.rooms).to.be.a('object');
                    expect(output.data.rooms[goblinValleyArea.areacode].length).to.equal(2);
                    output.data.rooms.should.deep.equal(roomTestObj.rooms);
                });
        });
    });
});