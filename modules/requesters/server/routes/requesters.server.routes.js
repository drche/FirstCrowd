'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var requestersPolicy = require('../policies/requesters.server.policy'),
  requesters = require('../controllers/requesters.server.controller'),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller'));

module.exports = function(app) {
  /*
   * REQUESTER TABLE
   */
  // ALL REQUESTER TASKS
  app.route('/api/requesters/tasks/all').post(requesters.requesterTasks.all);

  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/all').post(requesters.activeTask.all);

  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/all').post(requesters.suspendedTask.all);

  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/all').post(requesters.completedTask.all);

  // REJECTED TASKS
  app.route('/api/requesters/rejectedTask/all').post(requesters.rejectedTask.all);
  
  app.route('/api/tasks/completion/reject').post(requesters.submission.reject);
  app.route('/api/tasks/completion/approve').post(requesters.submission.approve);
  app.route('/api/tasks/completion/retry').post(requesters.submission.retry);

  // RATINGS
  app.route('/api/requesters/workerRating/makeRating').put(requesters.workerRating.makeRating);
  app.route('/api/requesters/workerRating/all').post(requesters.workerRating.all);
  app.route('/api/requesters/workerRating/delete').post(requesters.workerRating.delete);

  // file
  app.post('/api/requesters/task/file/download', requesters.taskFiles.downloadTaskFile);
  app.post('/api/requesters/task/file/sendMessage', requesters.taskFiles.sendMessage);
  app.post('/api/requesters/task/file/getDownloadables', requesters.taskFiles.getDownloadables);

  // REQUESTER INFORMATION
  app.route('/api/requesters/getRequesterData').post(requesters.getRequesterData.all);
  app.route('/api/requesters/getRequesterRatings').post(requesters.getRequesterData.ratings);

  app.route('/api/requesters/search/myTasks').post(taskSearch.searchTasks.searchMyTasks);

  /*
   * TASK TABLE
   */
  // TASK ACTIONS
  app.route('/api/tasks/createTask').post(requesters.taskActions.create);
  app.route('/api/tasks/deleteTask').post(requesters.taskActions.delete);
  app.route('/api/tasks/updateTask').put(requesters.taskActions.update);
  app.route('/api/tasks/getWorkerRatingsForTask').put(requesters.taskActions.getWorkerRatingsForTask);
  app.route('/api/tasks/getRequesterRatingsForTask').put(requesters.taskActions.getRequesterRatingsForTask);
  app.route('/api/tasks/getTasksWithOptions').post(requesters.taskFindWithOption);

  app.route('/api/tasks/payment/create').post(requesters.stateActions.payment.create);
  app.route('/api/tasks/payment/execute').post(requesters.stateActions.payment.execute);

  app.route('/api/tasks/preapproval/accept').post(requesters.stateActions.workerPick.preapproval.accept);
  app.route('/api/tasks/preapproval/reject').post(requesters.stateActions.workerPick.rejectBid);

  // Bidding
  app.route('/api/tasks/bidding/reject').post(requesters.stateActions.workerPick.rejectBid);
  app.route('/api/tasks/bidding/activate').post(requesters.stateActions.activateBidableTask);
  app.route('/api/tasks/bidding/bidder/info').post(requesters.biddingActions.bidderInfo);

  app.route('/api/tasks/bidding/payment/create').post(requesters.stateActions.payment.bidable.create);
  app.route('/api/tasks/bidding/payment/execute').post(requesters.stateActions.payment.bidable.execute);

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
