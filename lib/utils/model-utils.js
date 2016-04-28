'use strict';

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
  return req.options.model;
};

// Returns array of relationships for collection accessed by request
exports.getRelationships = function (req) {
  return req.options.associations;
};
