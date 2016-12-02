var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var assert = require('assert');

var sha256 = require('js-sha256').sha256;
var lib = require('redmudlib')();
var client = lib.client.instance();
var rex = require('../export-lib')(lib);

var charactername1 = 'Alder';
var username1 = 'testUser1';
var pwhash1 = sha256('12345');

var koboldValleyArea = {
    areacode: "KDV",
    name: "Kobold Valley",
    description: "A valley filled with dangerous Kobolds.",
    size: 0
};

var westernOverlook = {
    areacode: koboldValleyArea.areacode,
    roomnumber: 1,
    name: 'Western Overlook',
    description: 'A short cliff overlooks a small, fertile valley. You can see scores of Kobolds milling about doing whatever it is Kobolds do.'
};

describe('Basic character exporting', function() {
    beforeEach(function() {
        return client.flushallAsync();
    });

    after(function() {
        return client.flushallAsync();
    });

    describe('One character', function() {
        beforeEach(function() {
            return lib.area.async.createArea(koboldValleyArea.areacode, koboldValleyArea)
                .then(function() {
                    return Promise.all([
                            lib.room.async.addRoom(westernOverlook.areacode, westernOverlook),
                            lib.user.async.createUser(username1, pwhash1)
                        ])
                        .then(function() {
                            return lib.character.async.createCharacter(username1, charactername1, lib.util.buildRoomCode(westernOverlook.areacode, westernOverlook.roomnumber))
                        });
                });
        });

        it('Export One Character', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    should.exist(output);
                    output.should.be.an('object');
                    should.exist(output.data.characters);
                    output.data.characters.should.be.an('array');
                    output.data.characters.should.have.lengthOf(1);
                    output.data.characters[0].owner.should.equal(username1);
                    output.data.characters[0].name.should.equal(charactername1);
                    output.data.characters[0].room.should.equal(lib.util.buildRoomCode(westernOverlook.areacode, westernOverlook.roomnumber));
                });
        });
    });
});