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
  let JSONAPISerializer = require('jsonapi-serializer');
  let modelUtils = require('../utils/model-utils');
  let normUtils = require('../utils/norm-utils');
  let pluralize = require('pluralize');

  // Get access to `req`, `res`, & `sails`
  let req = this.req;
  let res = this.res;
  let sails = req._sails;
  let Model;

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Find model and begin constructing options
  let modelName = modelUtils.getModelName(req);
  sails.log.verbose('[jsonapi] modelName ::', modelName);
  Model = sails.models[modelName];
  let opts = {
    attributes: modelUtils.getAttributes(Model)
  };
  // Add related model data
  let relatedModelNames = modelUtils.getRelatedModelNames(req);
  relatedModelNames.forEach(function (model) {
    let pluralModel = pluralize(model);
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
  let jsonApiRes = new JSONAPISerializer(modelName, data, opts);

  // Set status code and send response
  res.status(200);
  return res.json(jsonApiRes);
};
