express-flickr-gallery
======================

Express middleware to enable the addition of a flickr gallery to any express
application.

## How does it work?
This module works by loading your flickr albums (also known as sets) and then
rendering them as a gallery page for you. For example, if you have 2 albums
and add this middleware to your app and navigate to _mysite.com/gallery_ you
will be presented with a page showing two thumbnails stating the album name
below. Clicking one of these will render a new page with thumbnails of all
images in the album.

## Usage as Middleware

In the below example you could use the following URLs:

* yoursite.com/gallery/ - A list of your sets/albums
* yoursite.com/gallery/:albumId - The images contained in album with _albumId_

```javascript
'use strict';

var express = require('express')
  , path = require('path')
  , app = express()
  , port = 8001
  , flickr = require('express-flickr-gallery');

// Use any view engine that you like...
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, './views'));

app.use('/gallery', flickr.middleware.init(express, {
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

```

### Middleware API
The middleware API is straightforward to use as it exposes only a single
function.

##### init(express, opts)
The init function must be provided an instance of _express_ as the first
parameter, you should use express 4+. _opts_ should be an Object containing the
following:

```javascript

{
  // Optional object that contains classes to apply to the rendered html
  // this will allow you to easily style and integrate this with your site
  renderer: {
    container: 'container-class',
    row: 'row-class',
    col: 'col-class'
  },

  // Options related to integrating with the flickr api
  flickr: {
    // If you place albums IDs in the below array then only those will be
    // shown in the list of albums
    // albums: []
    api_key: 'YOUR_FLICKR_API_KEY',
    secret: 'YOUR_FLICKR_API_SECRET',
    user_id: 'YOUR_FLICKR_USERNAME'
  },

  // The templates into which the album list and album content will be loaded
  templates: {
    // The strings here should correspond to your view name
    albumList: 'album-list',
    album: 'album-page'
  }
}

```
