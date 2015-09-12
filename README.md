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

For this to work you need to define two templates of your own that will inject
the HTML rendered by this middleware as described in the next section. For an
example of this being used in an actual website checkout my own site
photography page at [evanshortiss.com/photography](http://evanshortiss.com/photography)

## Usage as Middleware

#### Integrating with Express
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

// Called once the gallery has initialised
function onGalleryInitialised (err, router) {
  if (err) {
    console.error('Failed to init flickr middleware. Retry in 5 seconds');
    setTimeout(loadFlickrMiddleware, 5000);
  } else {
    app.use('/gallery', router);
    
    // Start to listen now that all routes are loaded
    app.listen(port, function (err) {
      if (err) {
        throw err;
      }
    
      console.log('Example server listening on port %s', port)
    });
  }
}

// Load the gallery middleware
// This is asynchronous so it can take a few seconds pending connection
// speed and the flickr API availability
flickr.middleware.init(express, {
  flickr: {
    // If you place albums IDs in the below array then only those will be
    // shown in the list and all your other albums are ignored
    // albums: []
    api_key: process.env.FLICKR_API_KEY,
    secret: process.env.FLICKR_SECRET,
    user_id: process.env.FLICKR_USER_ID
  },
  templates: {
    // The strings here should correspond to your views that the express-flickr
    // partials will be rendered in
    albumList: 'album-list',
    album: 'album-page'
  }
}, onGalleryInitialised);
```

Now you need to simply create the _album-page_ and _album-list_ templates. I
use Jade in all these examples, but you can use any language you like. For
example the _album-list_ template could look similar to that shown below. The
_expressFlickrHtml_ is a variable made available to your template for placement
wherever you like in your own page.

```jade
doctype
html
  head
    title= 'My Website!'
    link(rel='stylesheet', href='/css/style.css')
  body
    div.container
      div.album-list!= expressFlickrHtml
```

### Middleware API
The middleware API is straightforward to use as it exposes only a single
function.

##### init(express, opts[, callback])
The init function must be provided an instance of _express_ as the first
parameter, you should use express 4+. An optional callback can also be supplied
and is receommended to handle errors in the event that the flickr API is
unavailble. _opts_ should be an Object containing the following:

```javascript

{
  // Optional
  // Object that contains classes to apply to the rendered html
  // this will allow you to easily style and integrate this with your site
  renderer: {
    classNames: {
      container: 'container-class',
      row: 'row-class',
      col: 'col-class'
    }
  },

  // Required
  // Options related to integrating with the flickr api
  flickr: {
    // If you place albums IDs in the below array then only those will be
    // shown in the list of albums
    // albums: []
    api_key: 'YOUR_FLICKR_API_KEY',
    secret: 'YOUR_FLICKR_API_SECRET',
    user_id: 'YOUR_FLICKR_USERNAME'
  },

  // Required
  // The templates into which the album list and album content will be loaded
  templates: {
    // The strings here should correspond to your view name
    albumList: 'album-list',
    album: 'album-page'
  }
}

```

### Using the API Directly
You can also use this library to get a simplified JSON object representing
your albums and their content.

##### init(opts, callback)
Intialises the API. _opts_ can contain the following options.

* **api_key** - (required) Your flickr API
* **secret** - (required) Your flickr API secret
* **user_id** - (required) Your flickr user ID
* **albums** - (optional) The IDs of albums you'd like to restrict displaying. If left
empty all albums will be shown. If populated, only albums in the array will be
shown.
* **cache_expiry** - (optional) The amount of time in milliseconds to keep the in-memory cache of albums from flickr

##### getAlbumList(callback)
Get all your albums, or the ones specified in the albums _param_ supplied to
init.


##### getAlbum(id, callback)
Get the contents of an album using its ID.


