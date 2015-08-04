'use strict';

exports.normalizeData = function (data) {
  return JSON.parse(JSON.stringify(data));
};
