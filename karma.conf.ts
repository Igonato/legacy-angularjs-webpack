import {Config, ConfigOptions} from 'karma';
import webpackConfig from './webpack.config';


export default (config: Config) => {
    config.set({
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: ['index.test.js'],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'index.test.js': ['webpack', 'sourcemap'],
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage-istanbul'],
        // reporters: ['progress'],

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any
        // file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers:
        // https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        // @ts-ignore: does not exist on type
        coverageIstanbulReporter: {
            reports: [
                'json',
                'lcov',
                'text-summary',
            ],
            fixWebpackSourcePaths: true,
        },

        webpack: webpackConfig,

        // Hide webpack build information from output
        webpackMiddleware: {
            noInfo: 'errors-only',
        },
    } as ConfigOptions);
};
