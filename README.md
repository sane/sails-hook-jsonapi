<p align="center"><img src="/../images/sails.png?raw=true" height="80"/><img src="/../images/jsonapi.png?raw=true" height="80"/></p>

# sails-hook-jsonapi
[![Build Status](https://travis-ci.org/IanVS/sails-hook-jsonapi.svg?branch=master)](https://travis-ci.org/listepo/sails-hook-jsonapi)
[![Dependency Status](https://david-dm.org/IanVS/sails-hook-jsonapi.svg)](https://david-dm.org/IanVS/sails-hook-jsonapi)
[![devDependency Status](https://david-dm.org/IanVS/sails-hook-jsonapi/dev-status.svg)](https://david-dm.org/IanVS/sails-hook-jsonapi#info=devDependencies)



This is a [Sails JS](http://sailsjs.org) hook for creating an API which conforms to JSON API specifications per jsonapi.org.

*Note*: This project is still in development, and is not yet fully functional.

### Installation

`npm install sails-hook-jsonapi`

### Usage
*requires at least sails >= 0.11*

Just lift your app as normal, and your api responses will be formatted in accordance with [jsonapi.org](http://jsonapi.org/format/).

#### Options
Create a `jsonapi.js` file inside the `config/` directory of your app, and you can set the following options:

| Option        | Default   |  Description  |
|---------------|:---------:|---------------|
| `compoundDoc` |  `true`   | When set to 'true' (default), response will be a [compound document](http://jsonapi.org/format/#document-compound-documents). Otherwise, related resources will be nested within the top-level resource attributes. |
| `included`    |  `true`   | When set to `true` (default), related resource data will be [included](http://jsonapi.org/format/#fetching-includes) in the response. Currently, `include` parameters in client requests are not supported.  |


### Known Limitations

This is still a project-in-work.  So far, the following are not yet implemented:

- [ ] Included request parameter handling (400 response if present)
- [ ] Links
  - [ ] Top-level "self" links
  - [ ] Top-level "related" links
  - [ ] Resource-level "self" links
  - [ ] Related resource relationship links
  - [ ] Metadata links
- [ ] Pagination
- [ ] Formatting
  - [ ] Non-dasherized attributes
- [ ] Sparse fieldsets

There may be more.  Please submit issue reports.
