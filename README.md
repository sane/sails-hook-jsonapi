<p align="center"><img src="/../images/sails.png?raw=true" height="80"/><img src="/../images/jsonapi.png?raw=true" height="80"/></p>

# sails-hook-jsonapi
[![Build Status](https://travis-ci.org/sane/sails-hook-jsonapi.svg?branch=master)](https://travis-ci.org/sane/sails-hook-jsonapi)
[![Dependency Status](https://david-dm.org/sane/sails-hook-jsonapi.svg)](https://david-dm.org/sane/sails-hook-jsonapi)
[![devDependency Status](https://david-dm.org/sane/sails-hook-jsonapi/dev-status.svg)](https://david-dm.org/sane/sails-hook-jsonapi#info=devDependencies)

This is a [Sails JS](http://sailsjs.org) hook for creating an API which conforms to JSON API specifications per jsonapi.org.

*Note*: This project is still in development, and is not yet fully functional.

### Installation

`npm install sails-hook-jsonapi`

### Usage
*requires at least sails >= 0.11*

Just lift your app as normal, and your api responses will be formatted in accordance with [jsonapi.org](http://jsonapi.org/format/).

If you need to serialize data for other reasons (eg. send data trough sockets), you can use the serializeData method like this `serializedData = sails.hooks.jsonapi.serializeData(model,data);`.
This method takes 2 arguments
* *model:* The name of the model that you wish to serialize ('model' must be defined on the sails models).
* *data:* The data to be serialized.

#### Options
Create a `jsonapi.js` file inside the `config/` directory of your app, and you can set the following options:

| Option        | Default   |  Description  |
|---------------|:---------:|---------------|
| `compoundDoc` |  `true`   | When set to 'true' (default), response will be a [compound document](http://jsonapi.org/format/#document-compound-documents) including related resources. |
| `keyForAttribute` |  `dash-case`   | A function or string to customize attributes. Functions are passed the attribute as a single argument and expect a string to be returned. Strings are aliases for inbuilt functions for common case conversions. Options include: dash-case (default), lisp-case, spinal-case, kebab-case, underscore_case, snake_case, camelCase, CamelCase. |
| `pluralizeType` |  `true`   | When set to 'true' (default), the type is pluralized. |

### Known Limitations

This is unfinished. So far, the following are not yet implemented:

- Fetching resources
  - [ ] Included request parameter handling
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
- [ ] Fetching relationships
- [ ] Updating relationships
- [ ] Deleting relationships

There may be more. Please submit issue reports. Or better yet, pull requests.