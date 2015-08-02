'use strict';

let Barrels = require('barrels');
let path = require('path');
let Sails = require('sails').Sails;
let test = require('tape');
let loadConfig = require('../helpers/load-config');
let fixtures,
    sails;

test('Sails does not crash', function (t) {
  // Attempt to lift sails
  Sails().load(loadConfig, function (err, _sails) {
    sails = _sails;
    let barrels = new Barrels(path.join(process.cwd(), '/tests/fixtures'));
    fixtures = barrels.data;
    barrels.populate(function(err) {
      t.end(err);
    });
  });
})

test('Fixture models are loaded correctly', function (t) {
  t.plan(2);
  User.find().exec(function(err, users) {
    if (err) {
      t.fail(err);
    }
    t.ok(users, 'User model exists');
    t.equal(fixtures['user'].length, users.length, 'User model contains the same number of items as fixture');
  })
})

test('Returns correct attributes', function (t) {
  t.plan(7);

  sails.request({
    url: '/user',
    method: 'GET'
  }, function(err, res, body) {
    if (err) {
      t.fail(err);
    }
    t.ok(body.data, 'Body contains a "data" property');
    t.equal(body.data.length, 2, 'There are two user objects');
    t.equal(body.data[0].id, '1', 'First model id is 1');
    t.equal(body.data[0].type, 'users', 'First model type is "users"');
    t.ok(body.data[0].attributes, '"data" contains an "attributes" property');
    t.ok(body.data[0].attributes['first-name'], '"attributes" contains a "first-name" property');
    t.equal(body.data[0].attributes['first-name'], 'Peter', '"first-name" of the first model is "Peter"');
    t.end(err);
  });
})

test('Teardown', function (t) {
  sails.lower(function() {
    t.end();
    process.exit(0); // A hack because otherwise tests won't end.  See https://github.com/balderdashy/sails/issues/2309
  });
})

