'use strict';

module.exports = function jsonApiHook(sails) {
  var moduleUtils = require('./utils/module-utils');
  var _ = require('lodash');
  var normalizeQueryParams = require('./requests/query-params');
  var normalizePayload = require('./requests/payload');
  var util = require('util');
  var pluralize = require('pluralize');

  /**
   * Add custom response methods to `res`.
   *
   * @param {Request} req
   * @param {Response} res
   * @param  {Function} next [description]
   * @api private
   */
  var addResponseMethods = function (req, res) {
    // Attach custom responses to `res` object
    // Provide access to `req` and `res` in each of their `this` contexts.
    _.each(sails.middleware.jsonapi.responses, function eachMethod(responseFn, name) {
      sails.log.silly('Binding response ' + name + ' to ' + responseFn);
      res[name] = _.bind(responseFn, {
        req: req,
        res: res,
      });
    });
  };

  // binds PATCH routes
  var bindPatchRoutes = function () {
    // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L157-L370
    _.each(sails.middleware.controllers, function eachController(controller, controllerId) {
      var _getRestRoute;
      var baseRouteName;
      var baseRoute;
      var Model;
      var routeOpts;
      var _bindRoute;

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L112-L113
      var hook = sails.hooks.blueprints;

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L163-L166
      var config = _.merge({}, sails.config.blueprints, controller._config || {});

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L373-L387
      var _getMiddlewareForShadowRoute = function (controllerId, blueprintId) {
        return sails.middleware.controllers[controllerId][blueprintId.toLowerCase()] || hook.middleware[blueprintId.toLowerCase()];
      };

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L288
      var _getAction = _.partial(_getMiddlewareForShadowRoute, controllerId);

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L161
      var globalId = sails.controllers[controllerId].globalId;

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L262-L270
      var routeConfig = sails.router.explicitRoutes[controllerId] || {};
      var modelFromGlobalId = _.find(sails.models, {globalId: globalId});
      var modelId = config.model || routeConfig.model || (modelFromGlobalId && modelFromGlobalId.identity) || controllerId;

      // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L272-L369
      if (sails.hooks.orm && sails.models && sails.models[modelId]) {
        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L281
        Model = sails.models[modelId];

        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L300-L310
        routeOpts = _.merge({ associations: _.cloneDeep(Model.associations) }, routeOpts);
        _bindRoute = function (path, action, options) {
          options = options || routeOpts;
          options = _.extend({}, options, {action: action, controller: controllerId});
          sails.router.bind(path, _getAction(action), null, options);
        };

        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L163-L166
        if (config.pluralize) {
          baseRouteName = pluralize(controllerId);
        } else {
          baseRouteName = controllerId;
        }

        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L163-L166
        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L232-L235
        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L293-L297
        if (config.restPrefix) {
          baseRoute = config.prefix + '/' + baseRouteName;
        } else {
          baseRoute = config.prefix + config.restPrefix + '/' + baseRouteName;
        }
        _getRestRoute = _.partialRight(util.format, baseRoute);

        // https://github.com/balderdashy/sails/blob/v0.12.2-0/lib/hooks/blueprints/index.js#L336-L368
        if (config.rest) {
          _bindRoute(_getRestRoute('patch %s/:id'), 'update');
        }
      }
    });
  };

  return {

    defaults: {
      __configKey__: {
        _hookTimeout: 10000, // wait 10 seconds before timing out
        compoundDoc : true,
        included    : true,
      }
    },

    initialize: function (cb) {
      sails.once('router:after', bindPatchRoutes);
      cb();
    },

    loadModules: function (cb) {
      var hook = this;
      moduleUtils.loadResponses(sails, function loadedJsonapiResponseModules(err, responseDefs) {
        if (err) return cb(err);
        // Register responses as middleware
        hook.middleware.responses = responseDefs;
        return cb();
      });
    },

    /**
     * Shadow route bindings
     * @type {Object}
     */
    routes: {
      before: {

        'all /*': function (req, res, next) {
          addResponseMethods(req, res);
          next();
        },

        'GET /*': function (req, res, next) {
          addResponseMethods(req, res);
          normalizeQueryParams(req, res);
          next();
        },

        'POST /*': function (req, res, next) {
          addResponseMethods(req, res);
          normalizePayload(req, next);
        },

        'PATCH /*': function (req, res, next) {
          addResponseMethods(req, res);
          normalizePayload(req, next);
        }
      }
    }
  };
};
