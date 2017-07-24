Promise = require('bluebird');

/*
* Remove some annoyed warnings
* */
if (Meteor.isClient) {
  Promise.config({
    warnings: false,
  });
}

