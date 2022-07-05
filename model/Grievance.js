const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');

const Comment = new Schema({
  comment: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Grievance = new Schema({
  grievanceTitle: {
    type: String,
    required: true,
  },
  grievanceDescription: {
    type: String,
    required: true,
  },
  grievanceStatus: {
    type: String,
    required: true,
  },
  grievanceType: {
    type: String,
    required: true,
  },
  grievancePriority: {
    type: String,
    required: true,
  },
  grievanceDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  grievanceUpdatedAt: {
    type: Date,
  },
  grievanceDepartment: {
    type: String,
    required: true,
  },
  grievanceCreatedBy: {
    type: String,
    required: true,
  },
  grievanceUpdatedBy: {
    type: String,
  },
  grievanceComments: [
    {
      type: Schema.Types.ObjectId,
      ref: Comment,
    },
  ],
});

module.exports = mongoose.model('Grievance', Grievance);
