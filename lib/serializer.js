'use strict';

const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = function (modelName, data) {
  let sails = this.req._sails;
  let sailsModel = sails.models[modelName];
  try {
    if (!sailsModel || typeof sailsModel === 'undefined') {
      throw new Error(`Looks like the model '${modelName}', does not exist.`);
    }
  } catch (err) {
    // throw 1;
    console.error(err);
    return {};
  }

  let attributes = [];
  Object.keys(sailsModel.definition).forEach(function (key) {
    if (!sailsModel.definition[key].primaryKey && !sailsModel.definition[key].alias) {
      attributes.push(key);
    }
  });
  let Serializer = new JSONAPISerializer(modelName, {
    attributes,
    keyForAttribute: sails.config.jsonapi.keyForAttribute,
    pluralizeType  : sails.config.jsonapi.pluralizeType
  });
  try {
    data = JSON.parse(JSON.stringify(data));
    return Serializer.serialize(data);
  } catch (err) {
    console.error(`Unable to parse '${data}' for model '${modelName}', rerurning empty object \n
      Attributes: ${attributes}`);
    return {};
  }
};
