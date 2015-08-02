module.exports = function jsonApiHook(sails) {

  var moduleUtils = require('./module-utils');

  return {

    // defaults: {
    //    __configKey__: {
    //       _hookTimeout: 20000 // wait 20 seconds before timing out
    //       dasherizeAttributes: true,
    //       pluralize: true
    //    }
    // }

    loadModules: function(cb) {
      var hook = this;

      moduleUtils.loadResponses(function loadedJsonapiResponseModules(err, responseDefs) {
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

        /**
         * Add custom response methods to `res`.
         *
         * @param {Request} req
         * @param {Response} res
         * @param  {Function} next [description]
         * @api private
         */
        'all /*': function addResponseMethods(req, res, next) {

          // Attach custom responses to `res` object
          // Provide access to `req` and `res` in each of their `this` contexts.
          _.each(sails.middleware.jsonapi.responses, function eachMethod(responseFn, name) {
            sails.log.silly('Binding response ' + name + ' to ' + responseFn);
            res[name] = _.bind(responseFn, {
              req: req,
              res: res
            });
          });

          // Proceed!
          next();
        }
      }
    }

  };
}
