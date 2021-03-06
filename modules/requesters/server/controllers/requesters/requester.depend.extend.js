'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's depend controller
 */

module.exports.depend = _.extend(
  require('./requester.file/requester.file.depend'),
  require('./requester.task.actions/requester.task.actions.depend')
);
