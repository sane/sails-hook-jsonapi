'use strict';

/*
 * Normalize filter
 *
 * JSON API uses 'filter' as query parameter.
 * Waterline expects a 'where' property on criteria object.
 */
var normalizeFilter = function (req) {
  if (req.query.filter !== undefined) {
    req.query.where = req.query.filter;
    delete req.query.filter;
  }
};

/*
 * Normalize sort
 *
 * JSON API uses comma as delimiter between multiple fields.
 * Waterline expects an key-value pair object for multiple fields.
 *
 * JSON API uses a hyphen to indicate descending sorting.
 * Waterline expects the value of object property to be 0 for descending
 * or 1 for ascending sort.
 */
var normalizeSort = function (req) {
  var sortFields;

  if (req.query.sort !== undefined) {
    sortFields = req.query.sort
                    .split(',');
    req.query.sort = {};
    sortFields.forEach(function (sortField) {
      var fieldName = sortField[0] === '-' ? sortField.substr(1) : sortField;
      req.query.sort[fieldName] = sortField[0] === '-' ? 0 : 1;
    });
  }
};

module.exports = function (req, res) {
  normalizeFilter(req);
  normalizeSort(req);
};
