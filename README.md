# (Legacy) AngularJS Webpack Setup

**work in progress, but everything is mostly together 🎉**

AngularJS Webpack setup that is friendly to dated projects. You can use
this for a new project just fine *if for some reason you want to start a new
project using AngularJS in %current_year%*.

To test the setup [legacy-angularjs-app] was made. Please, feel free to
suggest what else could be included there!

To quickly play with the setup:

```bash
git clone --recursive git@github.com:Igonato/legacy-angularjs-webpack.git
cd legacy-angularjs-webpack
npm install
npm start
```

[legacy-angularjs-app]: https://github.com/Igonato/legacy-angularjs-app


# Features

TODO: List features

# Commands

```bash
npm run build      # build and optimize files for production
npm run build:dev  # build files without optimization and watch for changes
npm start          # same as (npm run serve) - start the webpack-dev-server

# To watch for changes in the webpack config and restart the process:
npm run watchconf:build
npm run watchconf:build:prod
npm run watchconf:serve
```

# How to Migrate

TODO: Outline migration steps
