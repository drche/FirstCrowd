'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  coreController = require(path.resolve('./modules/core/server/controllers/core.server.controller')),
  _ = require('lodash'),
  validator = require('validator'),
  superIndividual = null;
  
var whitelistedFields = ['firstName', 'lastName', 'contactPreference', 'email', 'phone', 'username', 'middleName'];
  
/**
 * Find the Individual
 */
var findIndividual = function(req, res, callBack) {
  var individualID = req.user.individual;

  Individual.findById(individualID, function (err, individual) { 
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!individual) {
      return res.status(404).send({
        message: 'No Individual with that identifier has been found'
      });
    } else {
      superIndividual = individual;
      callBack(superIndividual);
    }
  });
};

/**
 * Get the Individual
 */
var getIndividual = function(req, res, callBack) {
  if (!superIndividual) {
    findIndividual(req, res, callBack);
  } else if (superIndividual.id !== req.user.individual) {
    if (!mongoose.Types.ObjectId.isValid(req.user.individual)) {
      return res.status(400).send({
        message: 'User is an invalid Individual'
      });
    }
    findIndividual(req, res, callBack);
  } else {
    callBack(superIndividual);
  }
};

/**
 * Show the current Individual
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var individual = req.individual ? req.individual.toJSON() : {};


  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  individual.isCurrentUserOwner = req.user && individual.user && individual.user._id.toString() === req.user._id.toString();

  res.jsonp(individual);
};

/**
 * Update a Individual
 */
exports.update = function(req, res) {
  var individual = req.individual;

  individual = _.extend(individual, req.body);

  individual.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individual);
    }
  });
};

/**
 * Delete an Individual
 */
exports.delete = function(req, res) {
  var individual = req.individual;

  individual.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individual);
    }
  });
};

/**
 * List of Individuals
 */
exports.list = function(req, res) {
  Individual.find().sort('-created').populate('user', 'displayName').exec(function(err, individuals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individuals);
    }
  });
};

/**
 * List of Certifications
 */
exports.listCertifications = function(req, res) {
  getIndividual(req, res, function(individual) {
    if (individual.certification) {
      res.jsonp(individual.certification);
    } else {
      res(null);
    }
  });
};

/**
 * Individual middleware
 */
exports.individualByID = function(req, res, next, id) {

  /* Individual.findById(id).populate('user', 'displayName').exec(function (err, individual) {
    if (err) {
      return next(err);
    } else if (!individual) {
      return res.status(404).send({
        message: 'No Individual with that identifier has been found'
      });
    }
    req.individual = individual;
    next();
  }); */
};

/**
 * Individual certification update
 */
exports.updateCertification = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      individual.certification = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Education update
 */
exports.updateEducation = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {

      individual.degrees = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Skills update
 */
exports.updateSkill = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      for (var i in req.body) {
        if (req.body[i].locationLearned) {
          req.body[i].locationLearned = req.body[i].locationLearned.split(',');
        }
      }
      individual.skills = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Experience update
 */
exports.updateExperience = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      for (var i in req.body) {
        if (req.body[i].skills) {
          req.body[i].skills = req.body[i].skills.split(',');
        }
      }
      individual.jobExperience = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Bio update
 */
exports.updateBio = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      let user = new User(req.user);
      individual.bio = req.body;
      user = _.extend(user, _.pick(req.body, whitelistedFields));
      
      req.user = user;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
      
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          coreController.renderIndex(req, res);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

exports.getIndividual = function(req, res) {
  getIndividual(req, res, function(individual) {
    var safeIndividualObject = null;
    if (individual) {
      safeIndividualObject = {
        bio: {
          sex: individual.bio.sex,
          dateOfBirth: individual.bio.dateOfBirth,
          profession: individual.bio.profession,
          address: {
            country: individual.bio.address.country,
            zipCode: individual.bio.address.zipCode,
            state: individual.bio.address.state,
            city: individual.bio.address.city,
            streetAddress: individual.bio.address.streetAddress
          }
        },
        degrees: [{}],
        certification: [{}],
        jobExperience: [{}],
        skills: [{
          locationLearned: [{}]
        }]
      };
      for (var degree = 0; degree < individual.degrees.length; degree++) {
        if (individual.degrees[degree]) {
          safeIndividualObject.degrees[degree] = new Object();
          safeIndividualObject.degrees[degree]._id = individual.degrees[degree]._id;
          safeIndividualObject.degrees[degree].schoolName = individual.degrees[degree].schoolName;
          safeIndividualObject.degrees[degree].degreeLevel = individual.degrees[degree].degreeLevel;
          safeIndividualObject.degrees[degree].startDate = individual.degrees[degree].startDate;
          safeIndividualObject.degrees[degree].endDate = individual.degrees[degree].endDate;
          safeIndividualObject.degrees[degree].concentration = individual.degrees[degree].concentration;
          safeIndividualObject.degrees[degree].address = new Object();
          safeIndividualObject.degrees[degree].address.schoolCountry = individual.degrees[degree].address.schoolCountry;
          safeIndividualObject.degrees[degree].address.schoolStreetAddress = individual.degrees[degree].address.schoolStreetAddress;
          safeIndividualObject.degrees[degree].address.schoolCity = individual.degrees[degree].address.schoolCity;
          safeIndividualObject.degrees[degree].address.schoolState = individual.degrees[degree].address.schoolState;
          safeIndividualObject.degrees[degree].address.schoolZipCode = individual.degrees[degree].address.schoolZipCode;
        }
      }
      for (var exp = 0; exp < individual.jobExperience.length; exp++) {
        if (individual.jobExperience[exp]) {
          safeIndividualObject.jobExperience[exp] = new Object();
          safeIndividualObject.jobExperience[exp]._id = individual.jobExperience[exp]._id;
          safeIndividualObject.jobExperience[exp].employer = individual.jobExperience[exp].employer;
          safeIndividualObject.jobExperience[exp].description = individual.jobExperience[exp].description;
          safeIndividualObject.jobExperience[exp].jobTitle = individual.jobExperience[exp].jobTitle;
          safeIndividualObject.jobExperience[exp].startDate = individual.jobExperience[exp].startDate;
          safeIndividualObject.jobExperience[exp].endDate = individual.jobExperience[exp].endDate;
          safeIndividualObject.jobExperience[exp].skills = individual.jobExperience[exp].skills;
        }
      }
      for (var cert = 0; cert < individual.certification.length; cert++) {
        if (individual.certification[cert]) {
          safeIndividualObject.certification[cert] = new Object();
          safeIndividualObject.certification[cert]._id = individual.certification[cert]._id;
          safeIndividualObject.certification[cert].certificationName = individual.certification[cert].certificationName;
          safeIndividualObject.certification[cert].institution = individual.certification[cert].institution;
          safeIndividualObject.certification[cert].dateIssued = individual.certification[cert].dateIssued;
          safeIndividualObject.certification[cert].dateExpired = individual.certification[cert].dateExpired;
          safeIndividualObject.certification[cert].description = individual.certification[cert].description;
        }
      }
      for (var i = 0; i < individual.skills.length; i++) {
        if (individual.skills[i]) {
          safeIndividualObject.skills[i] = new Object();
          safeIndividualObject.skills[i]._id = individual.skills[i]._id;
          safeIndividualObject.skills[i].skill = individual.skills[i].skill;
          safeIndividualObject.skills[i].firstUsed = individual.skills[i].firstUsed;
          safeIndividualObject.skills[i].lastUsed = individual.skills[i].lastUsed;
          safeIndividualObject.skills[i].locationLearned = individual.skills[i].locationLearned;
        }
      }
    }
    res.json(safeIndividualObject || null);
  });
};

/**
 * create an individual
 */
exports.create = function(req, res) {
  
};
