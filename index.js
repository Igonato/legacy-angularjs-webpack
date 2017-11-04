/**
 * Import Libraries
 *
 * For solving weird import/export related quirks of different libraries
 * check out Webpack Shimming docs: https://webpack.js.org/guides/shimming/
 */
import 'angular';
import 'angular-route';

import 'html5-boilerplate/dist/css/main.css';
import 'html5-boilerplate/dist/css/normalize.css';
import 'imports-loader?this=>window!html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min'


/**
 * Import Scripts and Styles for the app
 */
let context = require.context(
    'app',  // Folder to import things from
    true,   // Include subdirectories
    // (no "bower", not ending on test.js or spec.js)
    /^((?!bower|test\.js$|spec\.js$).)*\.(js|css|scss|sass|less|styl)$/
);
context.keys().forEach(context);
