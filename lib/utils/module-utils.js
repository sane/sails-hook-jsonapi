'use strict';

var buildDictionary = require('sails-build-dictionary');
var path = require('path');
var _ = require('lodash');

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

/*
 * Load API request normalizations.
 *
 * @param {Object} options
 * @param {Function} cb
 */
exports.loadRequests = function (sails, cb) {
  buildDictionary.optional({
    dirname              : path.resolve(__dirname + '/../requests'),
    filter               : /(.+)\.js$/,
    useGlobalIdForKeyName: true
  }, bindToSails(sails, cb));
};

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
