'use strict';

let buildDictionary = require('sails-build-dictionary');
let path = require('path');
let _ = require('lodash');

function bindToSails(sails, cb) {
  return function (err, modules) {
    if (err) {
      return cb(err);
    }
    _.each(modules, function (module) {
      // Add a reference to the Sails app that loaded the module
      module.sails = sails;
      // Bind all methods to the module context
      _.bindAll(module);
    });
    return cb(null, modules);
  };
}


/**
 * Load custom API responses.
 *
 * @param {Object} options
 * @param {Function} cb
 */
exports.loadResponses = function (sails, cb) {
  buildDictionary.optional({
    dirname              : path.resolve(__dirname + '/../responses'),
    filter               : /(.+)\.js$/,
    useGlobalIdForKeyName: true
  }, bindToSails(sails, cb));
};
