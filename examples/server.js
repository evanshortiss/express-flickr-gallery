'use strict';

var express = require('express')
  , path = require('path')
  , app = express()
  , port = 8001
  , middleware = require('../index.js').middleware;

// Use any view engine that you like...
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, './views'));

app.use('/gallery', middleware.init(express, {
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
}));

app.listen(port, function (err) {
  if (err) {
    throw err;
  }

  console.log('Example server listening on port %s', port)
});
