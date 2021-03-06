'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  fs = require('fs');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'findJobIndex', 'sendMessage', 'getWorkerMsgFileName'];
var getUserTypeObject, taskFindOne, findJobIndex, sendMessage, getWorkerMsgFileName;
[getUserTypeObject, taskFindOne, findJobIndex, sendMessage, getWorkerMsgFileName] = moduleDependencies.assignDependantVariables(dependants);

// checks if the worker is active on the task
module.exports.youAreActiveOnTask = function(task, job) {
  if ((job.status === 'active' || job.status === 'submitted') && (task.status === 'open' || task.status === 'taken'))
    return true;
  return false;
};

// sets up the worker file exchange and checks some prerequsites
module.exports.setUpWorkerFileExchange = function(req, res, callBack) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    var taskId = req.body.taskId;
    // fins the task
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (!task) {
        return res.status(422).send({
          message: 'No task with that Id found.'
        });
      }
      // makes sure you are working on this task
      var jobIndex = findJobIndex(task.jobs, typeObj._id);
      if (jobIndex < 0) {
        return res.status(422).send({
          message: 'You are not a worker for this task.'
        });
      }
      return callBack(typeObj, task, jobIndex);
    });
  });
};

// sends a worker message
module.exports.sendWorkerMessage = function(message, taskId, workerId, timeInMin, callBack) {
  return sendMessage(message, taskId, workerId, timeInMin, getWorkerMsgFileName(), function(err, msg, timeStamp) {
    if (err) return callBack(err);
    callBack(null, { files: [], messages: { worker: msg }, timeStamp: timeStamp });
  });
};
