'use strict';

let path = require('path');

module.exports = {
  appPath: path.join(process.cwd(), 'tests/dummy'),
  port: 1338,
  hooks: {
    jsonapi: require('../../'),
    grunt: false,
    views: false,
    cors: false,
    csrf: false,
    i18n: false,
    pubsub: false,
    session: false,
  },
  log: {
    level: 'error'
  },
  connections: {
    test: {
      adapter: 'sails-memory'
    }
  },
  models: {
    connection: 'test',
    migrate: 'drop'
  }
}
