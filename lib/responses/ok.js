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

let moduleUtils = require('../utils/model-utils');

module.exports = function sendOK(data) {

  let JSONAPISerializer = require('jsonapi-serializer');

  // Get access to `req`, `res`, & `sails`
  let req = this.req;
  let res = this.res;
  let sails = req._sails;

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Set status code
  res.status(200);

  let modelName = moduleUtils.getModelName(sails, req);
  let modelDataAttrs = moduleUtils.stripRelationships(data, req);
  let jsonApiRes = new JSONAPISerializer(modelName, data, {
    attributes: moduleUtils.getAttributes(modelDataAttrs)
  });

  sails.log.verbose(jsonApiRes);
  return res.json(jsonApiRes);
};
