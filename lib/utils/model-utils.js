'use strict';

let pluralize = require('pluralize');

// Only attributes which are not primary key ('id') or have an alias (relationship)
exports.getOwnAttributes = function (Model) {
  let ownAttrs = [];
  Object.keys(Model.definition).forEach(function (key) {
    if (!Model.definition[key].primaryKey && !Model.definition[key].alias) {
      ownAttrs.push(key);
    }
  });
  return ownAttrs;
};

// Only strips primary key ('id')
exports.getAttributes = function (Model) {
  let attrs = [];
  Object.keys(Model._attributes).forEach(function (key) {
    if (!Model._attributes[key].primaryKey) {
      attrs.push(key);
    }
  });
  return attrs;
};

exports.getModelName = function (req) {
  return req.options.pluralize ? pluralize(req.options.model) : pluralize(req.options.model, 1);
};

exports.getRelatedModelNames = function (req) {
  let rels = [];
  req.options.associations.forEach(function (assoc) {
    let model = req.options.pluralize ? pluralize(assoc.alias) : pluralize(assoc.alias, 1);
    rels.push(model);
  });
  return rels;
};
