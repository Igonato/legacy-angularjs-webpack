import autoprefixer = require('autoprefixer');
import CleanWebpackPlugin = require('clean-webpack-plugin');
import CopyWebpackPlugin = require('copy-webpack-plugin');
import ExtractTextPlugin = require('extract-text-webpack-plugin');
import InlineChunkWebpackPlugin = require('html-webpack-inline-chunk-plugin');
import HtmlWebpackPlugin = require('html-webpack-plugin');

import {join, resolve} from 'path';
import * as webpack from 'webpack';


/**
 * Variables to Tweak
 *
 * (also, search for "Adjust" to see what else you might want to change)
 */
const APP_NAME = 'legacy-app';
const APP_ROOT = resolve(__dirname, APP_NAME);

// Actual application code folder (src/, src/appname/, etc...)
const APP_SRC = 'app';
const SRC_DIR = resolve(APP_ROOT, APP_SRC);
const APP_INDEX_HTML = join(__dirname, 'index.html');
const APP_INDEX_JS = join(__dirname, 'index.js');

// Set to false if you don't use bower
const BOWER_COMPONENTS = join(SRC_DIR, 'bower_components');
const DIST_DIR = resolve(__dirname, 'dist');

// Asset patterns for CopyWebpackPlugin
// Reference: https://github.com/webpack-contrib/copy-webpack-plugin#usage
const ASSETS = [{from: resolve(SRC_DIR, 'assets')}];


/**************************************************************************
                     Webpack Configuration Starts Here!
 **************************************************************************/
let config: webpack.Configuration = {};

/**
 * Current Environment
 *
 * `npm_lifecycle_event env variable` is the current "npm run" command
 */
let env = process.env.npm_lifecycle_event;
let isTest = env.indexOf('test') > -1;
let isBuild = env.indexOf('build') > -1;
let isProd = env === 'build';

/**
 * Context, Entry and Output
 *
 * Reference:
 *  - Entry and Context: https://webpack.js.org/configuration/entry-context/
 *  - Output: https://webpack.js.org/configuration/output/
 *
 * Both entry and output objects are managed by Karma when running tests
 */
config.context = APP_ROOT;
config.entry = isTest ? undefined : {
    [APP_NAME]: APP_INDEX_JS,
};

config.output = isTest ? undefined : {
    path: DIST_DIR,  // Absolute output directory
    filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',
};

/**
 * Devtool
 *
 * Type of sourcemap to generate for each environment
 *
 * Reference: https://webpack.js.org/configuration/devtool/
 */
if (isTest) {
    config.devtool = 'inline-source-map';
} else if (isProd) {
    config.devtool = false;
} else if (isBuild) {
    config.devtool = 'source-map';
} else {
    config.devtool = 'eval-source-map';
}


/**************************************************************************
                                  Loaders

 "Plugins" to read and transform different types of source files
 Reference: https://webpack.js.org/loaders/
 **************************************************************************/

/**
 * Babel
 *
 * Transform the latest version of JavaScript into CommonJS that can be
 * understood by most browsers (modules are processed by Webpack separately)
 *
 * Babel's angularjs-annotate plugin will transform angular
 * function($foo, $bar) {...} inject notation into ['foo', 'bar',
 * function(...) {...}] notation. The babel plugin seems to be the most
 * well-maintained tool for the task surpassing webpack analogous loader
 * and plugin
 */
const BABEL_LOADER = {
    loader: 'babel-loader',
    options: {
        presets: [['es2015', {modules: false}]],
        plugins: ['angularjs-annotate'],
    },
};

/**
 * AngularJS Template loader
 *
 * Transform `templateUrl: 'url'` to `template: require('path')`, but skip
 * for url values that startWith 'cache'. Adjust if needed
 */
const ANGULARJS_TEMPLATE_LOADER = {
    loader: 'string-replace-loader',
    options: {
        search: /templateUrl\s*:\s*['"`](.*?)['"`]\s*([,}])/gm,
        replace: (match, url, ending) =>
            url.startsWith('cache') ? match :
            `template: require('${ APP_SRC }/${ url }')${ ending }`,
    },
};

/**
 * Stylesheets
 *
 * No styles needed when testing
 *
 * Extract style to a separate .css file on build, .extract parameters:
 *  - fallback - loader to use when ExtractTextPlugin is disabled
 *      (see `new ExtractTextPlugin(...)` in the plugins section)
 *  - use - loader to process files
 *
 * Note: `importLoaders: 1` css-loader option is required by postcss-loader
 */
const CSS_LOADERS = isTest ? ['null-loader'] : ExtractTextPlugin.extract({
    fallback: {loader: 'style-loader', options: {sourceMap: true}},
    use: [{
        loader: 'css-loader',
        options: {sourceMap: !isProd, importLoaders: 1, minimize: isProd},
    }, {
        loader: 'postcss-loader',
        options: {plugins: () => [autoprefixer], sourceMap: !isProd}},
    ],
});


config.module = {rules: [
    /**
     * JavaScript
     */
    {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [BABEL_LOADER, ANGULARJS_TEMPLATE_LOADER],
    },
    /**
     * Stylesheets
     */
    {test: /\.css$/, use: CSS_LOADERS},
    {test: /\.s[ac]ss$/, use: [...CSS_LOADERS, 'sass-loader']},
    {test: /\.less$/, use: [...CSS_LOADERS, 'less-loader']},
    {test: /\.styl$/, use: [...CSS_LOADERS, 'stylus-loader']},
    /**
     * Assets
     */
    // TODO: url-loader
    {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader',
    },
    /**
     * Templates
     */
    // TODO: html-loader?
    // TODO: test pug/jade
    {
        test: /\.html$/,
        loader: 'raw-loader',
    },
    {
        test: /\.(pug|jade)$/,
        use: ['raw-loader', 'pug-html-loader'],
    },
]};

if (isTest) {
    config.module.rules.push(
    /**
     * Legacy tests may use global module function which results in a name
     * collision with Webpack's module object. Let's replace it with
     * angular.mock.module
     */
    {
        enforce: 'pre',
        test: /(test|spec)\.js$/,
        loader: 'string-replace-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
            search: /(\s|\()module\s?\(/gm,
            replace: (match, opening) => opening + 'angular.mock.module(',
        },
    },
    /**
     * Istanbul
     * https://github.com/deepsweet/istanbul-instrumenter-loader
     * Instrument JS files with istanbul-lib-instrument for subsequent code
     * coverage reporting
     */
    {
        enforce: 'post',
        test: /\.js$/,
        loader: 'istanbul-instrumenter-loader',
        exclude: /(node_modules|bower_components)/,
        options: {esModules: true},
    });
}

/**
 * Resolve
 *
 * Specifies import resolution order. Resolve bower dependencies and
 * also, support app root folder for "absolute" imports
 *
 * Reference: https://webpack.js.org/configuration/resolve/
 */
config.resolve = BOWER_COMPONENTS ? {
    modules: [BOWER_COMPONENTS, 'node_modules', APP_ROOT],
    descriptionFiles: ['bower.json', 'package.json'],
    mainFields: ['browser', 'main'],
} : {modules: ['node_modules', APP_ROOT]};


/**
 * Plugins
 *
 * Reference: https://webpack.js.org/configuration/plugins/
 */
config.plugins = [];

if (!isTest) {
    config.plugins.push(
        new ExtractTextPlugin({
            allChunks: true,
            disable: !isBuild,
            filename: isProd ? '[name].[contenthash].css' : '[name].css',
        }),

        // Get all libraries code to a separate vendor.bundle.js file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: (module) =>
                /(node_modules|bower_components)/.test(module.context),
        }),

        // Extracting manifest helps prevent changes to vendor bundle when
        // only app bundle has changed. For more information check out:
        // https://survivejs.com/webpack/optimizing/separating-manifest/
        new webpack.optimize.CommonsChunkPlugin({name: 'manifest'}),

        // Copy the html template and inject generated files in it
        new HtmlWebpackPlugin({template: APP_INDEX_HTML}),
        new InlineChunkWebpackPlugin({inlineChunks: ['manifest']}),

        // Define custom identifiers
        new webpack.DefinePlugin({
            IS_PRODUCTION: JSON.stringify(isProd),
        }),
    );
}

// Dev server plugins
if (!isBuild && !isTest) {
    // HMR (for styles)
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

// Build specific plugins
if (isBuild) {
    config.plugins.push(
        // Only emit files when there are no errors
        new webpack.NoEmitOnErrorsPlugin(),

        // Delete files from the previous build
        new CleanWebpackPlugin([join(DIST_DIR, '*')]),

        // Copy assets from (that weren't required from the source)
        // Reference: https://github.com/kevlened/copy-webpack-plugin
        new CopyWebpackPlugin(ASSETS),
    );
}

// Optimization plugins
if (isProd) {
    config.plugins.push(
        // Minify all javascript, switch loaders to minimizing mode
        new webpack.optimize.UglifyJsPlugin(),
    );
}

/**
 * Dev Server
 *
 * Reference: https://webpack.js.org/configuration/dev-server/
 */
config.devServer = {
    contentBase: DIST_DIR,
    hot: true,
    overlay: {
        warnings: true,
        errors: true,
    },
};

export default config;
