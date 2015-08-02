/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 * @param  {Object} data
 */

var _ = require('lodash');
var pluralize = require('pluralize');

function stripRelationships(modelData, req) {
  return _.transform(modelData, function (result, modelAttrs, modelId) {
    result.push(_.omit(modelAttrs, function omitKeys(value, key) {
      if (key === 'id') {
        return key
      } else {
        return _.find(req.options.associations, { 'alias': key });
      };
    }));
  }, []);
}

function getAttributes(modelData) {
  if (modelData.length > 0) {
    return Object.keys(modelData[0]);
  } else {
    return [];
  }
}

module.exports = function sendOK(data) {

  var JSONAPISerializer = require('jsonapi-serializer');

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Set status code
  res.status(200);

  // todo: use utils to get model
  var modelName = sails.config.blueprints.pluralize ? pluralize(req.options.model) : req.options.model;
  var modelDataAttrs = stripRelationships(data, req);
  new JSONAPISerializer(modelName, data, {
    attributes: getAttributes(modelDataAttrs)
  }).then(function (jsonApi) {
    sails.log.verbose(jsonApi);
    return res.json(jsonApi)
  });
};
