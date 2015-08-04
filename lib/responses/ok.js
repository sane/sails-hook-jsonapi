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

let modelUtils = require('../utils/model-utils');
let normUtils = require('../utils/norm-utils');
let pluralize = require('pluralize');

module.exports = function sendOK(data) {


  let JSONAPISerializer = require('jsonapi-serializer');

  // Get access to `req`, `res`, & `sails`
  let req = this.req;
  let res = this.res;
  let sails = req._sails;
  let Model;

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Set status code
  res.status(200);

  let modelName = modelUtils.getModelName(req);
  Model = req._sails.models[modelName];
  let opts = {
    attributes: modelUtils.getAttributes(Model)
  };
  let relatedModelNames = modelUtils.getRelatedModelNames(req);
  relatedModelNames.forEach(function (relatedModelName) {
    Model = req._sails.models[relatedModelName];
    opts[pluralize(relatedModelName)] = {
      attributes: modelUtils.getOwnAttributes(Model)
    };
  });

  // Clean up data (removes 'add' and 'remove' functions)
  data = normUtils.normalizeData(data);

  // Serialize to jsonapi
  let jsonApiRes = new JSONAPISerializer(modelName, data, opts);

  sails.log.verbose(jsonApiRes);
  return res.json(jsonApiRes);
};
