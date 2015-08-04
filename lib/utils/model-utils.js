'use strict';

let _ = require('lodash');
let pluralize = require('pluralize');

exports.getModelName = function (sails, req) {
  return sails.config.blueprints.pluralize ? pluralize(req.options.model) : req.options.model;
};

exports.stripRelationships = function (modelData, req) {
  return _.transform(modelData, function (result, modelAttrs, modelId) {
    result.push(_.omit(modelAttrs, function omitKeys(value, key) {
      if (key === 'id') {
        return key;
      } else {
        return _.find(req.options.associations, { 'alias': key });
      }
    }));
  }, []);
};

exports.getAttributes = function (modelData) {
  if (modelData.length > 0) {
    return Object.keys(modelData[0]);
  } else {
    return [];
  }
};

exports.getRelationships = function (modelData) {
  console.log(modelData);
};
