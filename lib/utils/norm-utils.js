'use strict';

exports.normalizeData = function (data) {
  try{
    data = JSON.parse(JSON.stringify(data));
    return data;
  }catch(err){
    console.error(`Unable to parse '${data}', returning empty object`);
    return {};
  }
};
