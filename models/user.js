(function (module) {

  "use strict";

  var mongoose = require('mongoose')
    , UserSchema;

  UserSchema = new mongoose.Schema({
    name:     { 'type': String, 'default': 'New User' },
    email:     { 'type': String },
    password: { 'type': String  }
  });

  module.exports = mongoose.model('User', UserSchema);

}(module));