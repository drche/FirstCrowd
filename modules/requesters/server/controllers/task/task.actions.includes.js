'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend task actions controller
 */
module.exports.actions = _.extend(
  require('./task.actions/universal.server.controller')
);
