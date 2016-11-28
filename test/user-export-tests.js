var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var assert = require('assert');

var sha256 = require('js-sha256').sha256;
var linq = require('linq');

var lib = require('redmudlib')();
var client = lib.client.instance();
var rex = require('../export-lib')(lib);

var username1 = 'testUser1';
var pwhash1 = sha256('12345');

var username2 = 'testUser2';
var pwhash2 = sha256('23456');

describe('Basic user exporting', function() {
    after(function() {
        return client.flushallAsync();
    });

    describe('One User', function() {
        beforeEach(function() {
            return client.flushallAsync()
                .then(function() {
                    return lib.user.async.createUser(username1, pwhash1);
                });
        });

        it('Export single user', function() {
            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.an('object');
                    expect(output.data.users).to.be.an('array');
                    expect(output.data.users.length).to.equal(1);
                    expect(output.data.users).to.deep.equal([{ username: username1, pwhash: pwhash1 }]);
                });
        });
    });

    describe('Multiple Users', function() {
        beforeEach(function() {
            return client.flushallAsync()
                .then(function() {
                    return Promise.all([
                        lib.user.async.createUser(username1, pwhash1),
                        lib.user.async.createUser(username2, pwhash2)
                    ]);
                });
        });

        it('Export two users', function() {
            var exp = linq.from([{ username: username1, pwhash: pwhash1 }, { username: username2, pwhash: pwhash2 }]).orderBy(function(u) { return u.username; }).toArray();

            return rex.object.exportAsync()
                .then(function(output) {
                    expect(output).to.be.an('object');
                    expect(output.data.users).to.be.an('array');
                    expect(output.data.users.length).to.equal(2);
                    expect(linq.from(output.data.users).orderBy(function(u) { return u.username; }).toArray()).to.deep.equal(exp);
                });
        });
    });
});