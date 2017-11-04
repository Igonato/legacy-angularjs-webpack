// Entry point for Karma tests
import './index';
import 'angular-mocks/angular-mocks';

// Import all *spec.js and *test.js files from the app:
let context = require.context('app', true, /^((?!bower).)*(spec|test)\.js$/);
context.keys().forEach(context);
