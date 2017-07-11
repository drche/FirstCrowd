'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  validator = require('validator'),
  Schema = mongoose.Schema;

/**
 * Requester Schema
 */
var TaskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: 'Please provide a title'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: Schema.Types.Mixed
  },
  skillsNeeded: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date,
    default: null,
    trim: true
  },
  totalProgress: {
    type: Number,
    default: 0
  },
  payment: {
    bidding: {
      bidable: {
        type: Boolean,
        default: false
      },
      startingPrice: {
        type: Number
      },
      minPrice: {
        type: Number
      },
      timeRange: {
        start: {
          type: Date
        },
        end: {
          type: Date
        }
      }
    },
    staticPrice: {
      type: Number,
      required: 'Please provide a price'
    },
    paymentInfo: {
      paymentType: {
        type: String,
        enum: ['paypal'],
        default: 'paypal',
        required: 'Please provide a payment type'
      },
      paid: {
        type: Boolean,
        default: false
      },
      paymentId: {
        type: String
      },
      payerId: {
        type: String
      },
      paymentObject: {
        type: Schema.Types.Mixed
      }
    }
  },
  status: {
    type: String,
    enum: ['open', 'inactive', 'taken', 'suspended', 'sclosed', 'fclosed'],
    default: 'inactive',
    required: 'Please provide a status'
  },
  multiplicity: {
    type: Number,
    default: 1
  },
  successFactor: {
    // this is the number of sccesses needed for the project to be considered a sccuess
    type: Number,
    default: 1
  },
  preapproval: {
    type: Boolean,
    default: true
  },
  secret: {
    type: Boolean,
    default: false
  },
  requester: {
    requesterType: {
      enterprise: {
        type: Boolean
      },
      individual: {
        type: Boolean
      }
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      required: 'Please provide a requester'
    }
  },
  jobs: {
    type: [{
      status: {
        type: String,
        enum: ['active', 'accepted', 'rejected', 'submitted'],
        required: 'Please provide a status'
      },
      ratingOnWorker: {
        overAllRating: {
          type: Number
        }
      },
      ratingOnRequester: {
        overAllRating: {
          type: Number
        }
      },
      worker: {
        workerType: {
          enterprise: {
            type: Boolean
          },
          individual: {
            type: Boolean
          }
        },
        workerId: {
          type: Schema.Types.ObjectId,
          required: 'Please provide a worker'
        }
      },
      progress: {
        type: Number,
        default: 0
      },
      timeSpent: { // in seconds
        type: Number,
        default: 0
      },
      awardAmount: {
        type: Number,
        default: 0
      },
      paymentRecieved: {
        type: Date,
        default: null
      },
      dateStarted: {
        type: Date,
        default: null
      }
    }],
    default: []
  },
  bids: {
    type: [{
      worker: {
        workerType: {
          enterprise: {
            type: Boolean
          },
          individual: {
            type: Boolean
          }
        },
        workerId: {
          type: Schema.Types.ObjectId,
          required: 'Please provide a worker'
        }
      },
      bid: {
        type: Number,
        required: 'Please provide a bid'
      },
      status: {
        type: String,
        enum: ['accepted', 'rejected', 'undecided'],
        default: 'undecided'
      }
    }],
    default: []
  },
  publicNotes: {
    type: [{
      note: {
        type: String,
        required: 'Please fill out the note',
        deafult: null
      },
      dateCreated: {
        type: Date,
        default: null,
        trim: true
      }
    }],
    default: []
  },
  privateNotes: {
    type: [{
      note: {
        type: String,
        required: 'Please fill out the note',
        deafult: null
      },
      dateCreated: {
        type: Date,
        default: null,
        trim: true
      }
    }],
    default: []
  },
  dateCreated: {
    type: Date,
    required: 'Please add a date created'
  },
  lastModified: {
    type: Date,
    default: null
  }
});

TaskSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});

mongoose.model('Task', TaskSchema);
