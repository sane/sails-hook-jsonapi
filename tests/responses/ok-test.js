/* global User, Author, Book */
'use strict';

var Barrels = require('barrels');
var path = require('path');
var Sails = require('sails').Sails;
var test = require('tape-catch');
var loadConfig = require('../helpers/load-config');
var jsonApiSchema = JSON.parse(
      require('fs').readFileSync('tests/jsonapi.schema', 'utf8')
    );
var validateJsonApi = require('ajv')().compile(jsonApiSchema);
var fixtures,
    barrels,
    sails;

test('Sails does not crash', function (t) {
  // Attempt to lift sails
  Sails().load(loadConfig, function (err, _sails) {
    if (err) {
      t.fail(err);
    }
    sails = _sails;
    barrels = new Barrels(path.join(process.cwd(), '/tests/fixtures'));
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
  t.plan(10);

  sails.request({
    url   : '/user',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
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

test('Returns correct nested resources', function (t) {
  t.plan(6);

  sails.config.jsonapi.compoundDoc = false;

  sails.request({
    url   : '/author',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.data[0].attributes.books, '"attributes" contains a "books" property');
      t.equal(typeof body.data[0].attributes.books, 'object', '"books" is an object');
      t.deepEqual(body.data[0].attributes.books[0].title, 'A Game of Thrones', '"title" of first book is "A Game of Thrones"');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Returns relationships for compound document', function (t) {
  t.plan(7);

  sails.config.jsonapi.compoundDoc = true;

  sails.request({
    url   : '/author',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.data[0].relationships, 'Body contains a "relationships" property');
      t.ok(body.data[0].relationships.books, 'Relationships contains a "books" property');
      t.ok(body.data[0].relationships.books.data, 'Relationships contains a "books" property');
      t.equal(body.data[0].relationships.books.data[0].type, 'books', '"type" of first book is "books"');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Returns included data', function (t) {
  t.plan(11);

  sails.config.jsonapi.compoundDoc = true;
  sails.config.jsonapi.included = true;

  sails.request({
    url   : '/author',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.included, 'Body contains an "included" property');
      t.equal(body.included.length, 3, 'Three books are included');
      t.ok(body.included[0].type, '"included" contains a "type" property');
      t.equal(body.included[0].type, 'books', '"type" of included is "books"');
      t.ok(body.included[0].id, 'Included data includes an "id" property');
      t.ok(body.included[0].attributes, 'Included data includes an "attributes" property');
      t.equal(typeof body.included[0].attributes, 'object', '"attributes" is an object');
      t.equal(body.included[0].attributes.title, 'A Game of Thrones', 'Title of first book is "A Game of Thrones"');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Does not return included data if "included = false"', function (t) {
  t.plan(5);

  sails.config.jsonapi.compoundDoc = true;
  sails.config.jsonapi.included = false;

  sails.request({
    url   : '/author',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.notOk(body.included, 'Body does not contain an "included" property');
      t.ok(body.data[0].relationships, 'But it still has a "relationships" property (compound doc)');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

/*
 * not supported yet
 *
test('Supports fetching relationships', function (t) {
  t.plan(2);

  sails.request({
    url   : '/author/1/relationships/books',
    method: 'GET'
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});
 */

test('Not found response is correct', function (t) {
  t.plan(2);

  sails.request({
    url   : '/not-found',
    method: 'GET'
  }, function (err) {
    try {
      t.equal(err.status, 404, 'HTTP status code is 404');
      t.ok(err.body === undefined, 'Body is empty');
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
