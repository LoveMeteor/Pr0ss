// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by picker.js.
import { name as packageName } from "meteor/picker";

// Write your tests here!
// Here is an example.
Tinytest.add('picker - example', function (test) {
  test.equal(packageName, "picker");
});
