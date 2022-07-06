const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Grievance = require('./Grievance');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Editor: Number,
    Admin: Number,
    Department: Number,
  },
  password: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
    },
  ],
  refreshToken: String,
});

module.exports = mongoose.model('User', userSchema);
