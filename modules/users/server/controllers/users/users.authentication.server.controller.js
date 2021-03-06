'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  userProfileController = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller.js')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  Individual = mongoose.model('Individual'),
  Enterprise = mongoose.model('Enterprise');
  
var rollWhitelistedData = userProfileController.whitelistedData.rollWhitelistedData;

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  // '/authentication/signin'
  '/authentication/signup'
];

/**
 * Signup
 */
module.exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  // delete req.body.roles;
  
  // puts userRole into a storeable format
  var userRole = [];
  for (var r in req.body.userRole) {
    if (req.body.userRole[r]) {
      userRole.push(r);
    }
  }

  req.body.userRole = userRole;
  // Init user and add missing fields
  var user = new User(req.body),
    hasUserRole = false;
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  // set this equal to undeifed for sparce indexing to work
  user.phone = undefined;

  // checks if enterprise or individual user
  // For security measurement we remove any admin privalges
  for (var i in user.roles) {
    if (user.roles[i] === 'admin') {
      user.roles.splice(i, 1);
    } else if (user.roles[i] === 'enterprise') {
      // adds and saves enterprise object and binds to user
      var enterpriseObj = new Enterprise();
      enterpriseObj.user = user.id;
      user.enterprise = enterpriseObj;
      enterpriseObj.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
    } else if (user.roles[i] === 'individual') {
      // adds and saves individual object and binds to user
      var individualObj = new Individual();
      individualObj.user = user.id;
      user.individual = individualObj;
      individualObj.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
    } else if (user.roles[i] === 'user') {
      hasUserRole = true;
    }
  }

  
  // always adds the user role to the user
  if (!hasUserRole) {
    user.roles.push('user');
  }
  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(user);
    }
  });
};

/**
 * Signin after passport authentication
 */
module.exports.signin = function (req, res, next) {
  // must have just password and username/email for passport to work
  if (!req.body.userRole) {
    return res.status(422).send({
      message: 'Must specify a role'
    });
  }
  var userRole = req.body.userRole;
  delete req.body.userRole;
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(422).send(info);
    } else {
      if (user.userRole.indexOf(userRole) <= -1)
        return res.status(422).send({
          message: 'Must select one of your roles'
        });
      // specify the user role
      if (req.body) {
        if (user.roles.indexOf('worker') > -1) {
          user.roles.splice(user.roles.indexOf('worker'), 1);
        }
        if (user.roles.indexOf('requester') > -1) {
          user.roles.splice(user.roles.indexOf('worker'), 1);
        }
        if (user.roles.indexOf('resourceOwner') > -1) {
          user.roles.splice(user.roles.indexOf('worker'), 1);
        }
        var found = false;
        for (var i = 0; i < rollWhitelistedData.length; i++) {
          if (rollWhitelistedData[i] === userRole) {
            user.roles.push(userRole);
            found = true;
          }
        }
        if (!found)
          return res.status(422).send({
            message: 'Can\'t update to that View'
          });
      }
      
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // Remove sensitive data before login
          user.password = undefined;
          user.salt = undefined;
          req.login(user, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json({ user: user, newRole: userRole });
            }
          }); 
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
module.exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
module.exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    if (req.query && req.query.redirect_to)
      req.session.redirect_to = req.query.redirect_to;

    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
module.exports.oauthCallback = function (strategy) {
  return function (req, res, next) {

    // info.redirect_to contains inteded redirect path
    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(info.redirect_to || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
module.exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  // Setup info object
  var info = {};

  // Set redirection path on session.
  // Do not redirect to a signin or signup page
  if (noReturnUrls.indexOf(req.session.redirect_to) === -1)
    info.redirect_to = req.session.redirect_to;

  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // Email intentionally added later to allow defaults (sparse settings) to be applid.
            // Handles case where no email is supplied.
            // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
            user.email = providerUserProfile.email;

            // And save the user
            user.save(function (err) {
              return done(err, user, info);
            });
          });
        } else {
          return done(err, user, info);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, info);
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
module.exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};
