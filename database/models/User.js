const { Schema, model } = require('mongoose');

const { appConfig } = require('../../config')

const User = new Schema({
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  role: {
    type: String,
    required: true,
    default: appConfig.USER_ROLE_TYPE1
  },
  access_token: String,
  refresh_token: String,
  resetPasswordToken:  String,

},{
  timestamps: true
});

module.exports = model('user', User);
