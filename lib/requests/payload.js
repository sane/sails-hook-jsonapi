'use strict';

module.exports = function (req, next) {
  var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
  var modelUtils = require('../utils/model-utils');
  var pluralize = require('pluralize');

  var JSONAPIDocument = req.body;
  var options = {
    keyForAttribute: 'camelCase'
  };

  // returns ID from a resource identifier object
  var getIdFromResourceIdentifierObject = function (resourceIdentifierObject) {
    return resourceIdentifierObject.id;
  };

  // need to setup `valueForRelationship` for every relationship
  modelUtils.getRelationships(req).forEach(function (relationship) {
    var pluralModelName = pluralize(relationship.collection || relationship.model);
    options[pluralModelName] = {
      valueForRelationship: getIdFromResourceIdentifierObject
    };
  });

  new JSONAPIDeserializer(options).deserialize(JSONAPIDocument, function (err, normalizedObject) {
    if (err) {
      throw err;
    }
    // ToDo: Fix jsonapi-serialzer
    // https://github.com/SeyZ/jsonapi-serializer/pull/79
    delete normalizedObject.id;

    req.body = normalizedObject;
    next();
  });
};
