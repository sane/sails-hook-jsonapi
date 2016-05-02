'use strict';

// guess model name by path
// https://github.com/balderdashy/sails/blob/0506f0681590dc92986985bc39609c88b718a997/lib/hooks/blueprints/onRoute.js#L86-L98
var getModelNameByPath = function (req) {
  var path = req.path;
  var sails = req._sails;
  var matches = path.match(/^\/(\w+).*$/);
  if (matches && matches[1] && sails.models[matches[1]]) {
    return matches[1];
  }
};

// Only attributes which are not primary key ('id') or have an alias (relationship)
exports.getOwnAttributes = function (Model) {
  var ownAttrs = [];
  Object.keys(Model.definition).forEach(function (key) {
    if (!Model.definition[key].primaryKey && !Model.definition[key].alias) {
      ownAttrs.push(key);
    }
  });
  return ownAttrs;
};

// Attributes for compound document style
exports.getRef = function (Model, cb) {
  Object.keys(Model.definition).forEach(function (key) {
    if (Model.definition[key].primaryKey) {
      return cb(key);
    }
  });
};

// Only strips primary key ('id')
exports.getAttributes = function (Model) {
  var attrs = [];
  Object.keys(Model._attributes).forEach(function (key) {
    if (!Model._attributes[key].primaryKey) {
      attrs.push(key);
    }
  });
  return attrs;
};

// Returns model name from request
exports.getModelName = function (req) {
  if (req.options.model) {
    return req.options.model;
  } else {
    return getModelNameByPath(req);
  }
};

// Returns array of relationships for collection accessed by request
exports.getRelationships = function (req) {
  var sails = req._sails;
  var associations;
  var modelName;

  if (req.options && req.options.associations) {
    associations = req.options.associations;
  } else {
    modelName = exports.getModelName(req);
    associations = sails.models[modelName].associations;
  }

  return associations;
};

// return true if relationship is populated
exports.isPopulatedRelationship = function (data, relationship) {
  var _ = require('lodash');
  // data may be an array of records or a single record
  var datum = _.isArray(data) ? data[0] : data;
  var value = datum[relationship.alias];
  // value may be a single value (to-one) or an array (to-many)
  var singleValue = _.isArray(value) ? value[0] : value;

  // assume that relationship is not populated if
  if (
    // it's a number
    _.isNumber(singleValue) ||
    // it's a string
    _.isString(singleValue)
  ) {
    return false;
  } else {
    return true;
  }
};
