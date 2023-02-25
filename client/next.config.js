// This file is automatically run by Next.js when the application is started up.
// It takes a look at the webpackDevMiddleware function and calls it with some predefined config that was defined in the middleware. We are chnaging a single option on there and asking it to poll for file changes every 300ms. Sometimes, file change detection can be an issue with Next.js so we will need to use this option of manually polling for changes.
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
