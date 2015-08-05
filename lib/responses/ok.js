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
  var JSONAPISerializer = require('jsonapi-serializer');
  var modelUtils = require('../utils/model-utils');
  var normUtils = require('../utils/norm-utils');
  var pluralize = require('pluralize');
  var Model,
      modelName,
      pluralModel,
      opts,
      relatedModelNames,
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
  relatedModelNames = modelUtils.getRelatedModelNames(req);
  relatedModelNames.forEach(function (model) {
    pluralModel = pluralize(model);
    Model = sails.models[model];
    // Related model attributes
    opts[pluralModel] = {
      attributes: modelUtils.getOwnAttributes(Model)
    };
    // Compound Document options
    if (sails.config.jsonapi.compoundDoc) {
      modelUtils.getRef(Model, function (ref) {
        opts[pluralModel].ref = ref;
      });
      opts[pluralModel].included = sails.config.jsonapi.included;
    }
  });

  // Clean up data (removes 'add' and 'remove' functions)
  data = normUtils.normalizeData(data);

  // Serialize to jsonapi
  jsonApiRes = new JSONAPISerializer(modelName, data, opts);

  // Set status code and send response
  res.status(200);
  return res.json(jsonApiRes);
};
