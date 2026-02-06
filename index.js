// index.js
const news = require('./news.js');
const tutorials = require('./tutorials.js');

// These names MUST match the --entry-point flag in your cloudbuild.yaml
exports.handleNews = news.handleNews;
exports.handleTutorials = tutorials.handleTutorials;