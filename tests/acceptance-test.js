/* global User, Author, Book */
'use strict';

var Barrels = require('barrels');
var path = require('path');
var Sails = require('sails').Sails;
var test = require('tape-catch');
var loadConfig = require('./helpers/load-config');
var fs = require('fs');
var ajv = require('ajv');
var _ = require('lodash');

var jsonApiSchema = JSON.parse(
      fs.readFileSync('tests/jsonapi.schema', 'utf8')
    );
var validateJsonApi = ajv().compile(jsonApiSchema);
var fixtures,
    barrels,
    sails;

test('Bootstrap: Sails does not crash', function (t) {
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

test('Bootstrap: User model and fixture is loaded correctly', function (t) {
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

test('Bootstrap: Author model and fixture is loaded correctly', function (t) {
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

test('Fetching records collection: returns correct attributes', function (t) {
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
      t.equal(body.data.length, 3, 'There are three user objects');
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

test('Fetching records collection: many-to relationship', function (t) {
  t.plan(6);

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
      t.ok(body.data[0].relationships, 'Resource object has relationships object');
      t.ok(_.isArray(body.data[0].relationships.books.data), 'Relationship value is an array for many-to relationship');
      t.deepEqual(body.data[0].relationships.books.data[0], { type: 'books', id: '1' }, 'Relationship data is an resource linkage as default');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Fetching records collection: one-to relationship', function (t) {
  t.plan(7);

  sails.request({
    url   : '/book',
    method: 'GET',
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.data[0].relationships, 'Resource object has relationships object');
      t.ok(
        typeof body.data[0].relationships.author.data === 'object' && !_.isArray(body.data[0].relationships.author.data),
        'Relationship value is an object for one-to relationship'
      );
      t.deepEqual(body.data[0].relationships.author.data, { type: 'authors', id: '1' }, 'Relationship data is an resource linkage as default');
      t.notOk(body.data[0].attributes.hasOwnProperty('author'), 'A relationship value should not appear as a attribute');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Fetching records collection: returns correct nested resources', function (t) {
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

test('Fetching records collection: returns relationships for compound document', function (t) {
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

test('Fetching records collection: returns included data', function (t) {
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

test('Fetching records collection: does not return included data if "included = false"', function (t) {
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

test('Fetching records collection: support simple sorting', function (t) {
  t.plan(4);

  sails.request({
    url   : '/user',
    data  : {sort: 'firstName'},
    method: 'GET'
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.deepEqual(
        body.data.map(function (d) {
          return d.id;
        }),
        ['2', '3', '1'],
        'Data is in correct order'
      );
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Fetching records collection: support descending sorting', function (t) {
  t.plan(4);

  sails.request({
    url   : '/user',
    data  : {sort: '-firstName'},
    method: 'GET'
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.deepEqual(
        body.data.map(function (d) {
          return d.id;
        }),
        ['1', '3', '2'],
        'Data is in correct order'
      );
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Fetching records collection: support sorting by multiple fields', function (t) {
  t.plan(4);

  sails.request({
    url   : '/user',
    data  : {sort: 'lastName,firstName'},
    method: 'GET'
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.deepEqual(
        body.data.map(function (d) {
          return d.id;
        }),
        ['2', '3', '1'],
        'Data is in correct order'
      );
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

/*
 * not supported yet
 */
test.skip('Fetching records collection: supports fetching relationships', function (t) {
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

/*
 * JSON API is agnostic about the strategies supported by a server.
 * The filter query parameter can be used as the basis for any number of filtering strategies.
 * Assuming waterline criteria object.
 */
test('Fetching records collection: supports filter', function (t) {
  t.plan(5);

  sails.request({
    url   : '/user',
    data  : {filter: JSON.stringify({lastName: 'Last'})},
    method: 'GET'
  }, function (err, res, body) {
    var idsInRes;
    if (err) {
      t.fail(err);
    }
    try {
      t.equal(res.statusCode, 200, 'HTTP status code is 200');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.equal(body.data.length, 2, 'Response contains two users');
      idsInRes = body.data.map(function (d) {
        return d.id;
      });
      t.ok(idsInRes.indexOf('2') !== -1 && idsInRes.indexOf('3') !== -1, 'Response contains correct users');
    } catch (err) {
      t.fail(err);
    }
    t.end();
  });
});

test('Fetching records: not found response is correct', function (t) {
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

test('Creating a resource: simple', function (t) {
  t.plan(9);

  sails.request({
    url   : '/author',
    method: 'POST',
    data  : {
      data: {
        type      : 'authors',
        attributes: {
          name: 'George Orwell'
        }
      }
    }
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    try {
      // response
      t.equal(res.statusCode, 201, 'HTTP status code is 201 Created');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.equal(typeof body.data, 'object', 'Response data is a resource object.');
      t.equal(body.data.type, 'authors', 'Type of resource object in response is correct.');
      t.ok(body.data.id, 'Server-side generated id is part of resource object in response.');
      t.equal(body.data.attributes.name, 'George Orwell', 'Attribute of resource object in response is correct.');
      // persistence in database
      Author.findOne(body.data.id).exec(function (err, record) {
        if (err) {
          t.fail(err);
        }
        t.ok(record, 'Resource is persisted in database.');
        // prevent tests to throw if resource is not persisted and record is null
        if (record) {
          t.equal(record.name, 'George Orwell', 'Attribute is persisted in database');
        }
        t.end();
      });
    } catch (err) {
      t.fail(err);
    }
  });
});

test('Creating a resource: one-to relationship', function (t) {
  t.plan(8);

  sails.config.jsonapi.compoundDoc = true;

  sails.request({
    url   : '/book',
    method: 'POST',
    data  : {
      data: {
        type      : 'books',
        attributes: {
          title: 'A Clash of Kings'
        },
        relationships: {
          author: {
            data: {
              type: 'authors',
              id  : '1'
            }
          }
        }
      }
    }
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    // response
    try {
      t.equal(res.statusCode, 201, 'HTTP status code is 201 Created');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.data.relationships.author, 'Relationship is part of resource object in response');
      t.deepEqual(body.data.relationships.author.data, {type: 'authors', id: '1'}, 'Relationship of resource object in response points to correct record');
      t.notOk(body.data.attributes.hasOwnProperty('author'), 'A relationship value should not appear as a attribute');
    } catch (err) {
      t.fail(err);
    }
    // persistence in database
    try {
      Book.findOne(body.data.id).populate('author').exec(function (err, record) {
        if (err) {
          t.fail(err);
        }
        try {
          t.ok(record, 'Resource is persisted in database.');
          t.equal(record.author.id, 1, 'Relationship is persisted');
        } catch (err) {
          t.fail(err);
        }
        t.end();
      });
    } catch (err) {
      t.fail(err);
    }
  });
});

test('Creating a resource: many-to relationship', function (t) {
  t.plan(7);

  sails.config.jsonapi.compoundDoc = true;

  sails.request({
    url   : '/user',
    method: 'POST',
    data  : {
      data: {
        name      : 'users',
        attributes: {
          fistName: 'John',
          lastName: 'Doe'
        },
        relationships: {
          groupieOf: {
            data: [
              {
                type: 'authors',
                id  : '1'
              },
              {
                type: 'authors',
                id  : '2'
              }
            ]
          }
        }
      }
    }
  }, function (err, res, body) {
    if (err) {
      t.fail(err);
    }
    // response
    try {
      t.equal(res.statusCode, 201, 'HTTP status code is 201 Created');
      t.equal(res.headers['Content-Type'], 'application/vnd.api+json', 'Sends jsonapi mime type');
      t.ok(validateJsonApi(body), 'Body is a valid JSON API');
      t.ok(body.data.relationships['groupie-of'], 'Relationship is part of resource object in response');
      t.deepEqual(
        body.data.relationships['groupie-of'].data.map(function (relationship) {
          return relationship.id;
        }),
        ['1', '2'],
        'Relationships are correct'
      );
    } catch (err) {
      t.fail(err);
    }
    // persistence in database
    try {
      User.findOne(body.data.id).populate('groupieOf').exec(function (err, record) {
        if (err) {
          t.fail(err);
        }
        try {
          t.ok(record, 'Resource is persisted in database.');
          t.deepEqual(
            record.groupieOf.map(function (rel) {
              return rel.id;
            }),
            [1, 2],
            'Relationship is persisted'
          );
        } catch (err) {
          t.fail(err);
        }
        t.end();
      });
    } catch (err) {
      t.fail(err);
    }
  });
});

test('Bootstrap: Fetching record: teardown', function (t) {
  sails.lower(function () {
    t.end();
    process.exit(0); // A hack because otherwise tests won't end.  See https://github.com/balderdashy/sails/issues/2309
  });
});
