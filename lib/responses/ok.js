'use strict';
/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 * @param  {Object} data
 */

module.exports = function sendOK(data) {
  var JSONAPISerializer = require('jsonapi-serializer').Serializer;
  var modelUtils = require('../utils/model-utils');
  var normUtils = require('../utils/norm-utils');
  var Model,
      modelName,
      opts,
      relationships,
      jsonApiRes;

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;


  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Find model and begin constructing options
  modelName = modelUtils.getModelName(req);
  sails.log.verbose('[jsonapi] modelName ::', modelName);
  Model = sails.models[modelName];
  opts = {
    attributes: modelUtils.getAttributes(Model)
  };
  // Add related model data
  relationships = modelUtils.getRelationships(req);
  relationships.forEach(function (relationship) {
    var alias = relationship.alias;
    var collection = relationship.model || relationship.collection;
    Model = sails.models[collection];
    // Related model attributes
    opts[alias] = {
      attributes: modelUtils.getOwnAttributes(Model)
    };
    // Compound Document options
    if (sails.config.jsonapi.compoundDoc) {
      modelUtils.getRef(Model, function (ref) {
        opts[alias].ref = ref;
      });
      opts[alias].included = sails.config.jsonapi.included;
    }
  });

  // normalize relationships
  // jsonapi-serializer expects every relationship to be wrapped in an object
  relationships.forEach(function (relationship) {
    var alias = relationship.alias;
    var value = data[alias];
    // assume string or number to be id of related ressource
    if (typeof value === 'string' || typeof value === 'number') {
      data[alias] = { id: value };
    }
  });

  // Clean up data (removes 'add' and 'remove' functions)
  data = normUtils.normalizeData(data);

  // Serialize to jsonapi
  jsonApiRes = new JSONAPISerializer(modelName, opts).serialize(data);

  // Set mime type
  res.set('Content-Type', 'application/vnd.api+json');

  // Set status code
  res.status(200);

  // Send response
  return res.json(jsonApiRes);
};
