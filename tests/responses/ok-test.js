/* global User, Author, Book */

'use strict';

let Barrels = require('barrels');
let path = require('path');
let Sails = require('sails').Sails;
let test = require('tape-catch');
let loadConfig = require('../helpers/load-config');
let fixtures,
    sails;

test('Sails does not crash', function (t) {
  // Attempt to lift sails
  Sails().load(loadConfig, function (err, _sails) {
    if (err) {
      t.fail(err);
    }
    sails = _sails;
    let barrels = new Barrels(path.join(process.cwd(), '/tests/fixtures'));
    fixtures = barrels.data;
    barrels.populate(function (err) {
      if (err) {
        t.fail(err);
      }
      t.end(err);
    });
  });
});

test('User model and fixture is loaded correctly', function (t) {
  t.plan(3);

  User.find().exec(function (err, users) {
    if (err) {
      t.fail(err);
    }
    t.ok(users, 'User model exists');
    t.ok(fixtures['user'], 'user fixture loaded');
    if (users && fixtures['user']) {
      t.equal(fixtures['user'].length, users.length, 'User model contains the same number of items as fixture');
    } else {
      t.end();
    }
  });
});

test('Author model and fixture is loaded correctly', function (t) {
  t.plan(3);

  Author.find().exec(function (err, authors) {
    if (err) {
      t.fail(err);
    }
    t.ok(authors, 'Author model exists');
    t.ok(fixtures['author'], 'author fixture loaded');
    if (authors && fixtures['author']) {
      t.equal(fixtures['author'].length, authors.length, 'Author model contains the same number of items as fixture');
    } else {
      t.end();
    }
  });
});

test('Book model and fixture is loaded correctly', function (t) {
  t.plan(3);

  Book.find().exec(function (err, books) {
    if (err) {
      t.fail(err);
    }
    t.ok(books, 'Book model exists');
    t.ok(fixtures['book'], 'book fixture loaded');
    if (books && fixtures['book']) {
      t.equal(fixtures['book'].length, books.length, 'Book model contains the same number of items as fixture');
    } else {
      t.end();
    }
  });
});

test('Returns correct attributes', function (t) {
  t.plan(7);

  sails.request({
    url   : '/user',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.ok(body.data, 'Body contains a "data" property');
      t.equal(body.data.length, 2, 'There are two user objects');
      t.equal(body.data[0].id, '1', 'First model id is 1');
      t.equal(body.data[0].type, 'users', 'First model type is "users"');
      t.ok(body.data[0].attributes, '"data" contains an "attributes" property');
      t.ok(body.data[0].attributes['first-name'], '"attributes" contains a "first-name" property');
      t.equal(body.data[0].attributes['first-name'], 'Peter', '"first-name" of the first model is "Peter"');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });

});

test('Returns correct relationships', function (t) {
  t.plan(4);

  sails.request({
    url   : '/author',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.ok(body.data.relationships, 'Body contains a "relationships" property');
      t.ok(body.data.relationships.books, 'Relationships contains a "books" property');
      t.ok(body.data.relationships.books[0].data, 'Relationships contains a "books" property');
      t.equal(body.data.relationships.books[0].data.type, 'books', '"type" of first book is "books"');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });

});

test('Teardown', function (t) {
  sails.lower(function () {
    t.end();
    process.exit(0); // A hack because otherwise tests won't end.  See https://github.com/balderdashy/sails/issues/2309
  });
});
