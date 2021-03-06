/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    // attributes
    firstName: 'STRING',
    lastName: 'STRING',
    email: 'EMAIL',
    password: 'STRING',

    // relationships
    groupieOf: {
      collection: 'author',
      via: 'groupies'
    }
  }
};
