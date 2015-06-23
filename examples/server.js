'use strict';

console.log('Make sure to set the env vars FLICKR_API_KEY, FLICKR_SECRET' +
        'FLICKR_USER_ID or to replace them in exmaples/server.js.');

var express = require('express')
  , path = require('path')
  , app = express()
  , port = 8001
  , middleware = require('../index.js').middleware;

// Use any view engine that you like...
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, './views'));

loadFlickrMiddleware();

// Load the flickr middleware
function loadFlickrMiddleware () {
  console.log('Initialising flickr gallery middleware');
  middleware.init(express, {
    flickr: {
      // If you place albums IDs in the below array then only those will be
      // shown in the list
      // albums: []
      api_key: process.env.FLICKR_API_KEY,
      secret: process.env.FLICKR_SECRET,
      user_id: process.env.FLICKR_USER_ID
    },
    templates: {
      // The strings here should correspond to your views
      albumList: 'album-list',
      album: 'album-page'
    }
  }, onGalleryLoaded);
}

// Once the middleware loads start the app
function onGalleryLoaded (err, route) {
  if (err) {
    console.error('Failed to init flickr middleware. Retry in 5 seconds');
    setTimeout(loadFlickrMiddleware, 5000);
  } else {
    console.log('flickr middleware initialised');
    console.log('starting application');

    app.use('/gallery', route);
    app.listen(port, function (err) {
      if (err) {
        throw err;
      }

      console.log('Example server listening on port %s.', port);
      console.log('Go to 127.0.0.1:%s%s', port, '/gallery');
    });
  }
}
