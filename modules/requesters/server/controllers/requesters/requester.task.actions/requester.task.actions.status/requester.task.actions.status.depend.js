'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['taskFindOne', 'findRequesterByTask', 'removeTaskFromRequesterArray'];
var taskFindOne, findRequesterByTask, removeTaskFromRequesterArray;
[taskFindOne, findRequesterByTask, removeTaskFromRequesterArray] = moduleDependencies.assignDependantVariables(dependants);

// set the status for the task
exports.setStatus = function(taskId, status, callBack) {
  // finds the task
  taskFindOne(taskId, function (err, task) {
    if (err) {
      // TODO: *** should remove from requester task list *** //
      callBack({ error: errorHandler.getErrorMessage(err) });
    }
    // find the requester by the task
    findRequesterByTask(task, function(err, requester) {
      if (err)
        callBack(err);
      // sets the reuqester status
      setStatusRequester(status, task._id, requester, function (typeObj) {
        // set the workers status
        setStatusOfWorkers(getWorkersIds(task.jobs), status, task._id, function() {
          // set the task status
          task.status = status;
          // save the type object
          typeObj.save(function (typeErr, typeObj) {
            if (typeErr) {
              callBack(errorHandler.getErrorMessage(typeErr));
            } else {
              // save the task
              task.save(function (err, task) {
                if (err) {
                  callBack(errorHandler.getErrorMessage(err));
                } else {
                  callBack(null, 'Status for task ' + task.title + ' updated successfully');
                }
              });
            }
          });
        });
      });
    });
  });
};

// set the task to sclosed or fclosed
exports.setTaskStatus = function(requester, task, callBack) {
  var successes = 0;
  var jobsAllDone = true;
  // on jobs completion
  for (var job = 0; job < task.jobs.length; job++) {
    if (task.jobs[job].status === 'accepted')
      successes++;
    else if (task.jobs[job].status === 'active' || task.jobs[job].status === 'submitted')
      jobsAllDone = false;
  }
  if (!jobsAllDone)
    callBack(null);
  // set task status
  if (successes >= task.successFactor)
    task.status = 'sclosed';
  else
    task.status = 'fclosed';
  // set the requester status
  setStatusRequester(task.status, task._id, requester, function(requester) {
    // save task
    task.save(function(err, task) {
      if (err) return callBack(errorHandler.getErrorMessage(err));
      requester.save(function(err) {
        if (err) return callBack(errorHandler.getErrorMessage(err));
        return callBack(null, task);
      });
    });
  });
};

// sets the status of the requester by task status
function setStatusRequester(status, taskId, typeObj, callBack) {
  typeObj = removeTaskFromRequesterArray(taskId, typeObj);
  switch (status) {
    case 'open':
      typeObj.requester.activeTasks = statusPushTo(taskId, typeObj.requester.activeTasks);
      break;
    case 'inactive':
      typeObj.requester.suspendedTasks = statusPushTo(taskId, typeObj.requester.suspendedTasks);
      break;
    case 'taken':
      typeObj.requester.activeTasks = statusPushTo(taskId, typeObj.requester.activeTasks);
      break;
    case 'suspended':
      typeObj.requester.suspendedTasks = statusPushTo(taskId, typeObj.requester.suspendedTasks);
      break;
    case 'sclosed':
      typeObj.requester.completedTasks = statusPushTo(taskId, typeObj.requester.completedTasks);
      break;
    case 'fclosed':
      typeObj.requester.rejectedTasks = statusPushTo(taskId, typeObj.requester.rejectedTasks);
      break;
  }
  // save typeObj first to avoid orphaned tasks
  callBack(typeObj);
}
exports.setStatusRequester = setStatusRequester;

// removes that taskId from the requester arrays
exports.removeTaskFromRequesterArray = function(taskId, typeObj) {
  if (typeObj.requester) {
    if (typeObj.requester.activeTasks)
      typeObj.requester.activeTasks = removeFromObjectTasksArray(taskId, typeObj.requester.activeTasks);
    if (typeObj.requester.suspendedTasks)
      typeObj.requester.suspendedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.suspendedTasks);
    if (typeObj.requester.completedTasks)
      typeObj.requester.completedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.completedTasks);
    if (typeObj.requester.rejectedTasks)
      typeObj.requester.rejectedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.rejectedTasks);
  }
  return typeObj;
};

// removes that taskId from the worker arrays
function removeTaskFromWorkerArray(taskId, typeObj) {
  if (typeObj.worker) {
    if (typeObj.worker.activeTasks)
      typeObj.worker.activeTasks = removeFromObjectTasksArray(taskId, typeObj.worker.activeTasks);
    if (typeObj.worker.inactiveTasks)
      typeObj.worker.inactiveTasks = removeFromObjectTasksArray(taskId, typeObj.worker.inactiveTasks);
    if (typeObj.worker.completedTasks)
      typeObj.worker.completedTasks = removeFromObjectTasksArray(taskId, typeObj.worker.completedTasks);
    if (typeObj.worker.rejectedTasks)
      typeObj.worker.rejectedTasks = removeFromObjectTasksArray(taskId, typeObj.worker.rejectedTasks);
    if (typeObj.worker.recomendedTasks)
      typeObj.worker.recomendedTasks = removeFromObjectTasksArray(taskId, typeObj.worker.recomendedTasks);
  }
  return typeObj;
}
exports.removeTaskFromWorkerArray = removeTaskFromWorkerArray;

// changes tasks current status and adds task to one of the requester arrays
function statusPushTo(taskId, array) {
  if (typeof array != 'undefined' && array instanceof Array)
    if (array.length > 0 && taskId) {
      array.push({ taskId: taskId });
      return array;
    }
  array = [];
  if (taskId)
    array.push({ taskId: taskId });
  return array;
}
exports.statusPushTo = statusPushTo;

// finds the task in the array and if it matches the taskId, removes it
function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++)
    if (array[i].taskId.toString() === taskId.toString())
      array.splice(i, 1);
  return array;
}
exports.removeFromObjectTasksArray = removeFromObjectTasksArray;

// get worker ids for a list of task jobs
function getWorkersIds(jobs) {
  var workersEnterprise = [];
  var workersIndividual = [];
  for (var job = 0; job < jobs.length; job++) {
    if (jobs[job].worker) {
      if (jobs[job].worker.workerId)
        if (jobs[job].worker.workerType) {
          if (jobs[job].worker.workerType.enterprise) {
            workersEnterprise.push(jobs[job].worker.workerId);
          } else if (jobs[job].worker.workerType.individual) {
            workersIndividual.push(jobs[job].worker.workerId);
          } else {
            workersEnterprise.push(jobs[job].worker.workerId);
            workersIndividual.push(jobs[job].worker.workerId);
          }
        } else {
          workersEnterprise.push(jobs[job].worker.workerId);
          workersIndividual.push(jobs[job].worker.workerId);
        }
    }
  }
  return { enterpriseIds: workersEnterprise, individualIds: workersIndividual };
}
exports.getWorkersIds = getWorkersIds;

// sets the status of the worker
function setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId) {
  if (!errorIds)
    errorIds = [];
  workerId = null;
  // if it has enterpriseIds
  if (workerIdArray.enterpriseIds) {
    // finds all the enterprises and sets their status and saves them marking error ids
    workerId = workerIdArray.enterpriseIds.shift();
    // if there is no more enteprriseIds delete that field
    if (workerIdArray.enterpriseIds.length <= 0)
      delete workerIdArray.enterpriseIds;
    // find the enterprise
    Enterprise.find({ '_id': workerId }, function(err, enterprise) {
      if (err) {
        errorIds.push({ error: err, workerId: workerId });
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else if (enterprise.length <= 0) {
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else {
        // set the status of the worker
        enterprise = enterprise[0];
        enterprise = removeTaskFromWorkerArray(taskId, enterprise);
        enterprise = addWorkerTaskWithStatus(status, taskId, enterprise);
        // save the enterprise
        enterprise.save(function(err, enterprise) {
          if (err)
            errorIds.push({ error: err, workerId: workerId });
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        });
      }
    });
  // if it has individual Ids
  } else if (workerIdArray.individualIds) {
    // finds all the individuals and sets their status and saves them marking error ids
    workerId = workerIdArray.individualIds.shift();
    // if there are no more individuals delete that field
    if (workerIdArray.individualIds.length <= 0)
      delete workerIdArray.individualIds;
    // find the indivudal
    Individual.find({ '_id': workerId }, function(err, individual) {
      if (err) {
        errorIds.push({ error: err, workerId: workerId });
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else if (individual.length <= 0) {
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else {
        // sets the status of the individual
        individual = individual[0];
        individual = removeTaskFromWorkerArray(taskId, individual);
        individual = addWorkerTaskWithStatus(status, taskId, individual);
        // save the individual
        individual.save(function(err, individual) {
          if (err)
            errorIds.push({ error: err, workerId: workerId });
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        });
      }
    });
  } else {
    // once recursive call is all done return the errorIds
    callBack(errorIds);
  }
}
exports.setStatusOfWorkers = setStatusOfWorkers;

// adds a worker with a certain status
function addWorkerTaskWithStatus(status, taskId, typeObj) {
  switch (status) {
    case 'open':
      typeObj.worker.activeTasks = statusPushTo(taskId, typeObj.worker.activeTasks);
      break;
    case 'inactive':
      typeObj.worker.inactiveTasks = statusPushTo(taskId, typeObj.worker.inactiveTasks);
      break;
    case 'taken':
      typeObj.worker.activeTasks = statusPushTo(taskId, typeObj.worker.activeTasks);
      break;
    case 'suspended':
      typeObj.worker.inactiveTasks = statusPushTo(taskId, typeObj.worker.inactiveTasks);
      break;
    case 'sclosed':
      typeObj.worker.completedTasks = statusPushTo(taskId, typeObj.worker.completedTasks);
      break;
    case 'fclosed':
      typeObj.worker.rejectedTasks = statusPushTo(taskId, typeObj.worker.rejectedTasks);
      break;
  }
  return typeObj;
}
exports.addWorkerTaskWithStatus = addWorkerTaskWithStatus;
