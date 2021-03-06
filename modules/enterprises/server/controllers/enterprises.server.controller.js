'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  User = mongoose.model('User'),
  passport = require('passport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  coreController = require(path.resolve('./modules/core/server/controllers/core.server.controller')),
  _ = require('lodash'),
  Fuse = require('fuse.js'),
  validator = require('validator'),
  superEnterprise = null;

var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var getNestedProperties = moduleDependencies.getDependantByKey('getNestedProperties');

var whitelistedFields = ['contactPreference', 'email', 'phone', 'username', 'middleName', 'displayName'],
  whitelistedPartnersFields = ['img', '_id', 'profile.companyName', 'profile.countryOfBusiness', 'profile.URL', 'profile.description', 'profile.classifications', 'profile.yearEstablished', 'specialities', 'catalog', 'demands'];

/**
 * Find the Enterprise
 */
var findEnterprise = function(req, res, callBack) {
  var enterpriseID = req.user.enterprise;
  // find the enterprise and set the super enterprise
  Enterprise.findById(enterpriseID, function (err, enterprise) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!enterprise) {
      return res.status(404).send({
        message: 'No Enterprise with that identifier has been found'
      });
    } else {
      superEnterprise = enterprise;
      callBack(superEnterprise);
    }
  });
};

/**
 * Get the Enterprise
 */
 // this function is called when you dont want to query the mongodb each time you get the enterprise
var getEnterprise = function(req, res, callBack) {
  if (!superEnterprise) {
    findEnterprise(req, res, callBack);
  } else if (!req.user) {
    return res.status(400).send({
      message: 'User is not logged in'
    });
  } else if (superEnterprise.id !== req.user.enterprise) {
    if (!mongoose.Types.ObjectId.isValid(req.user.enterprise)) {
      return res.status(400).send({
        message: 'User is an invalid Enterprise'
      });
    }
    findEnterprise(req, res, callBack);
  } else {
    callBack(superEnterprise);
  }
};

/**
 * Enterprise middleware
 */
module.exports.enterpriseByID = function(req, res, next, id) {

};

/**
 * update Enterprise Profile
 */
module.exports.updateProfile = function(req, res) {
  // if we have information sent from the front
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {

      req.user.displayName = req.body.profile.companyName;

      var user = new User(req.user);
      // pick only whitelisted fields from the sent object
      user = _.extend(user, _.pick(req.body, whitelistedFields));
      req.user = user;

      delete req.body.email;
      delete req.body.phone;
      enterprise.profile = req.body.profile;
      // save the enterprise
      enterprise.save(function (err, enterprise) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // save the user
          user.save(function (err, user) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              // send back the user and enterprise objects along with a success message
              return res.status(200).send({
                user: user,
                enterprise: enterprise,
                message: 'Profile Update!'
              });
            }
          });
        }
      });


    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

// given an id Id
// find an id in an array like [{ _id : "id" }]
// where Id === "id" and return the index
function findIdInArray(array, Id) {
  Id = Id.toString();
  var i;
  for (i = 0; i < array.length; i++) {
    if (array[i]._id && array[i]._id.toString() === Id) {
      return i;
    }
  }
  return -1;
}

// updates the partner array of an enterprise
// where enum key = ['supplier', 'competitor', 'customer']
function updatePartner(req, res, key) {
  // if information exists else error
  if (req.body) {
    // find the enterprise
    getEnterprise(req, res, function (enterprise) {
      var partner = req.body[key],
        message = '',
        index = -1;
      // if we want to delete the specified partner the req.body.delete will eval to true
      if (req.body.delete && partner._id) {
        // find the index of the partner specifed for deletion
        index = findIdInArray(enterprise.partners[key], partner._id);
        // if id exists
        if (index >= 0) {
          // remove partner
          enterprise.partners[key].splice(index, 1);
        }
      // else we want to update or create a partner
      } else if (!req.body.delete) {
        // if there is an id, update partner
        if (partner._id) {
          index = findIdInArray(enterprise.partners[key], partner._id);
          if (index >= 0) {
            enterprise.partners[key][index] = partner;
          }
        // otherwise create a new partner based on the information
        } else {
          enterprise.partners[key].push(partner);
          index = enterprise.partners[key].length - 1;
        }
      }
      // save the enterprise
      enterprise.save(function (err, enterprise) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // find proper return message
          message = key + ' updated!';
          if (req.body.delete)
            message = key + ' deleted!';
          // build the return object
          var obj = {};
          obj.message = message;
          obj[key] = enterprise.partners[key][index];
          return res.status(200).send(obj);
        }
      });
    });
  } else {
    return res.status(200).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
}

/**
 * update Enterprise Suppliers
 */
module.exports.updateSuppliers = function(req, res) {
  updatePartner(req, res, 'supplier');
};

/**
 * update Enterprise Competitors
 */
module.exports.updateCompetitors = function(req, res) {
  updatePartner(req, res, 'competitor');
};

/**
 * update Enterprise Customers
 */
module.exports.updateCustomers = function(req, res) {
  updatePartner(req, res, 'customer');
};

// gets the partner array of an enterprise
// where enum key = ['supplier', 'competitor', 'customer']
function getPartners(req, res, key) {
  Enterprise.findById(req.body.enterpriseId, function (err, thisEnterprise) {
    if (err) {
      return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
    } else if (!thisEnterprise) {
      return res.status(422).send({ message: 'No Enterprise with that identifier has been found' });
    } else {
      var entIds = [];
      thisEnterprise.partners[key].forEach(function(ele) {
        if (ele.enterpriseId)
          entIds.push(ele.enterpriseId);
      });
      findPartnersWhiteFields(entIds, function(err, partners) {
        if (err)
          return res.status(422).send({ message: err });
        var obj = {};
        // add the 's' on the end for front end support
        obj[key + 's'] = partners;
        return res.json(obj);
      });
    }
  });
}

/**
 * Function performed upon partners
 */
module.exports.partners = {
  //
  getSuppliers: function(req, res) {
    getPartners(req, res, 'supplier');
  },
  getCustomers: function(req, res) {
    getPartners(req, res, 'customer');
  },
  getCompetitors: function(req, res) {
    getPartners(req, res, 'competitor');
  }
};

// get build the partner object to send to the front
function findPartnersWhiteFields(enterpriseIds, callBack) {
  // find each partner
  Enterprise.find({ '_id': { $in: enterpriseIds } }, function (err, enterprises) {
    if (err)
      return callBack(errorHandler.getErrorMessage(err));
    // get user ids for each partner
    var userIds = [];
    enterprises.forEach(function(ele) {
      if (ele.user)
        userIds.push(ele.user);
    });
    // find each user
    User.find({ '_id': { $in: userIds } }, function (err, users) {
      if (err)
        return callBack('Error connecting partners to users');
      // add the specified user feilds to the partners
      var partners = enterprises.map(function(ent) {
        for (var user = 0; user < users.length; user++) {
          if (users[user]._id.toString() === ent.user.toString()) {
            ent.img = users[user].profileImageURL;
            break;
          }
        }
        // remove non whitelisted fields from the enterprise
        return getNestedProperties(ent, whitelistedPartnersFields);
      });
      // return the partners
      callBack(null, partners);
    });
  });
}

// get the catalog items
// where enum itemName = ['products', 'services']
function getCatalogItems(req, res, itemName) {
  Enterprise.findById(req.body.enterpriseId, function (err, enterprise) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!enterprise) {
      return res.status(422).send({
        message: 'No Enterprise with that identifier has been found'
      });
    } else {
      // build the return obj
      var obj = {};
      if (enterprise.catalog && enterprise.catalog[itemName]) {
        obj[itemName] = enterprise.catalog[itemName];
      } else {
        obj[itemName] = [];
      }
      return res.json(obj);
    }
  });
}

// catalog actions
module.exports.catalog = {
  getProducts: function(req, res) {
    getCatalogItems(req, res, 'products');
  },
  getServices: function(req, res) {
    getCatalogItems(req, res, 'services');
  }
};

// get the demands
module.exports.getDemands = function(req, res) {
  // find the enterprise
  Enterprise.findById(req.body.enterpriseId, function (err, enterprise) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!enterprise) {
      return res.status(422).send({
        message: 'No Enterprise with that identifier has been found'
      });
    } else {
      // return the demands
      if (enterprise.demands)
        return res.json({ demands: enterprise.demands });
      else
        return res.json({ demands: [] });
    }
  });
};

// fuzzy query the enterprise db
module.exports.fuzzyEntepriseQuery = function(req, res) {
  var query = req.body.query;
  if (query)
    // get all enterprises
    Enterprise.find({}, function (err, ents) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      // set the options for FUSE
      var options = {
        shouldSort: true,
        threshold: 0.15,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        // these are the searchable fields
        keys: [
          'profile.companyName',
          'profile.companyAddress.country',
          'profile.companyAddress.displayAddress',
          'profile.classifications.name',
          'catalog.products',
          'catalog.services'
        ]
      };
      var results = [];
      if (query.match('[0-9]+')) { // it is a number check classification codes
        query = parseFloat(query);
        ents.forEach(function(ent) {
          for (var classify = 0; classify < ent.profile.classifications.length; classify++) {
            var classifyCode = parseFloat(ent.profile.classifications[classify].code),
              thresholdCode = classifyCode * parseFloat(options.threshold);
            if ((classifyCode + thresholdCode) >= query && query >= (classifyCode - thresholdCode)) {
              results.push(ent);
              break;
            }
          }
        });
      } else { // this is a letter query FUSE
        // map the ents to a new modifiable ent and format the string
        ents = ents.map(function(ent) {
          var newEnt = JSON.parse(JSON.stringify(ent));
          newEnt.profile.companyAddress.displayAddress = newEnt.profile.companyAddress.streetAddress + ' ' + newEnt.profile.companyAddress.city + ' ' + newEnt.profile.companyAddress.state + ' ' + newEnt.profile.companyAddress.zipCode + ' ' + newEnt.profile.companyAddress.country;
          return newEnt;
        });
        // set up and query the ents
        var fuse = new Fuse(ents, options);
        results = fuse.search(req.body.query);
      }
      // return the whitelisted fields from the query
      results = results.map(function(ent) {
        return getNestedProperties(ent, whitelistedPartnersFields);
      });
      res.json({ searchResults: results });
    });
};

/**
 * get Enterprise object
 */
module.exports.getEnterprise = function(req, res) {
  getEnterprise(req, res, function (enterprise) {
    var safeEnterpriseObject = null;
    if (enterprise) {
      // this gives us a clean object with no extra information
      safeEnterpriseObject = {
        _id: enterprise._id,
        profile: {
          companyName: enterprise.profile.companyName,
          URL: enterprise.profile.URL,
          countryOfBusiness: enterprise.profile.countryOfBusiness,
          description: enterprise.profile.description,
          classifications: enterprise.profile.classifications,
          yearEstablished: enterprise.profile.yearEstablished,
          employeeCount: enterprise.profile.employeeCount,
          companyAddress: {
            country: enterprise.profile.companyAddress.country,
            streetAddress: enterprise.profile.companyAddress.streetAddress,
            city: enterprise.profile.companyAddress.city,
            state: enterprise.profile.companyAddress.state,
            zipCode: enterprise.profile.companyAddress.zipCode
          }
        },
        partners: {
          supplier: enterprise.partners.supplier,
          customer: enterprise.partners.customer,
          competitor: enterprise.partners.competitor
        }
      };
    }
    res.json(safeEnterpriseObject || null);
  });
};


//------------------------------- FOR TESTING ONLY --------------------------------------------
module.exports.setupEnterpriseGraph = function(req, res) {
  getEnterprise(req, res, function (myEnterprise) {
    var entConnect = [];
    for (var numEnts = getRandomNumber(30, 100); numEnts > 0; numEnts--) {
      entConnect.push(makeNewEnterprise());
    }
    myEnterprise.partners = {
      supplier: [],
      customer: [],
      competitor: []
    };
    entConnect.push(myEnterprise);
    for (var onThisEnt = 0; onThisEnt < entConnect.length; onThisEnt++) {
      var thisEnt = entConnect[onThisEnt];
      var stillCanCon = [];
      var random = null;
      for (var i = 0; i < entConnect.length; i++)
        stillCanCon.push({ ent: entConnect[i], canCon: true });
      for (var sup = getRandomNumber(1, 5); sup >= 0; sup--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.supplier.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
      for (var cus = getRandomNumber(1, 5); cus >= 0; cus--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.customer.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
      for (var com = getRandomNumber(1, 5); com >= 0; com--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.competitor.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
    }
    recurseSaveEnts(entConnect, res);
  });
};

function recurseSaveEnts(entArray, res, errors) {
  if (entArray.length > 0) {
    (entArray.pop()).save(function (err, ent) {
      if (err) {
        if (!errors)
          errors = [];
        errors.push(err);
      }
      if (ent)
        console.log(JSON.stringify(ent.partners, null, 1) + '\n');
      return recurseSaveEnts(entArray, res, errors);
    });
  } else {
    console.log(errors);
    return res.status(200).send(errors);
  }
}

function makeNewEnterprise() {
  var user = new User({
    userRole: ['worker', 'requester'],
    provider: 'local',
    roles: ['user', 'requester'],
    contactPreference: 'email'
  });
  var ent = new Enterprise({
    user: user._id,
    profile: {
      countryOfBusiness: 'US',
      companyAddress: {}
    },
    partners: {
      supplier: [],
      customer: [],
      competitor: []
    }
  });
  user.enterprise = ent._id;
  user.username = generateRandomString(getRandomNumber(15, 25));
  user.email = generateRandomString(getRandomNumber(5, 7)) + '.' + generateRandomString(getRandomNumber(5, 7)) + '@gmail.com';
  user.phone = getRandomNumber(1111111111, 9999999999);
  user.firstName = generateRandomString(getRandomNumber(4, 10));
  user.lastName = generateRandomString(getRandomNumber(4, 10));
  user.displayName = user.firstName + ' ' + user.lastName;
  user.profileImageURL = 'modules/users/client/img/profile/logo-' + getRandomNumber(1, 20) + '.jpg';
  user.save();

  ent.profile.companyName = generateRandomString(10);
  ent.profile.URL = 'www.' + generateRandomString(8) + '.com';
  ent.profile.description = 'This is the description of ' + ent.profile.companyName;
  ent.profile.yearEstablished = getRandomNumber(1950, 2017);
  ent.profile.employeeCount = getRandomNumber(1, 10000);
  ent.profile.companyAddress.country = 'US';
  ent.profile.companyAddress.streetAddress = generateRandomString(5) + ' Rd';
  ent.profile.companyAddress.city = generateRandomString(5) + 'burg';
  ent.profile.companyAddress.state = 'IL';
  ent.profile.companyAddress.zipCode = getRandomNumber(100000, 999999);

  ent.catalog = {};
  var i = 0;
  ent.catalog.services = [];
  for (i = getRandomNumber(2, 10); i > 0; i--) {
    ent.catalog.services.push({
      price: getRandomNumber(200, 1000),
      productName: generateRandomString(getRandomNumber(8, 12)),
      description: generateRandomString(getRandomNumber(30, 40))
    });
  }
  ent.catalog.products = [];
  for (i = getRandomNumber(2, 10); i > 0; i--) {
    ent.catalog.products.push({
      payment: {
        price: getRandomNumber(200, 1000),
        negotiable: getRandomNumber(1, 0)
      },
      productName: generateRandomString(getRandomNumber(8, 12)),
      description: generateRandomString(getRandomNumber(30, 40)),
      maker: ent._id
    });
  }
  ent.demands = [];
  for (i = getRandomNumber(2, 10); i > 0; i--) {
    ent.demands.push({
      productName: generateRandomString(getRandomNumber(8, 16)),
      quantity: getRandomNumber(20, 400)
    });
  }

  return ent;
}

function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomString(length) {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz';

  for (var i = 0; i < length; i++)
    text += possible.charAt(getRandomNumber(0, possible.length - 1));
  return text;
}

module.exports.getThisEnterprise = getEnterprise;
