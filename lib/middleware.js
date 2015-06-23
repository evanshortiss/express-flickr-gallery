'use strict';

var renderer = require('./render')
  , flickr = require('./flickr')
  , async = require('async')
  , path = require('path')
  , templates = null;


/**
 * Initialises the middleware.
 * Expects the same options as the init call from the plain library plus some
 * extras required for rendering.
 * @param  {Object} express Express instance being used
 * @param  {Object} opts
 * @return {Express.Router}
 */
exports.init = function (express, opts, callback) {
  var route = new express.Router();

  if (!callback) {
    callback = function () {};
  }

  // Tell the renderer which class names to apply to each image
  renderer.setOptions(opts.renderer);

  // The templates we'll render for the user. Must have the following format:
  // {
  //    album: 'album-template-filename'
  //    albumList: 'album-list-template-filename'
  // }
  templates = opts.templates;

  // Options should contain the following:
  // "albums" Are the names of albums you'd like to allow users load if ommitted
  // users can load any of your albums and the application will show them all

  flickr.init(opts.flickr, function (err) {
    if (err) {
      callback(err, null);
    } else {
      // Albums list, true arg means return json
      route.get('/', renderAlbumList);

      // Album image list (thumbnails), true arg means return json
      route.get('/:albumId', renderAlbum);

      callback(null, route);
    }
  });

  return route;
};


/**
 * Callback to call once all rendering steps have been completed
 * @param  {Object}   res   response object
 * @param  {Function} next  next variable from express for incoming requests
 * @return {Function}
 */
function getRenderCallback (res, next) {
  return function (err, html) {
    if (err) {
      next(err);
    } else {
      res.send(html);
    }
  };
}


/**
 * Render the user defined template for this route.
 * @param  {Object}   res
 * @param  {String}   tplName
 * @param  {String}   html
 * @param  {Function} callback
 */
function renderUserTemplate (res, tplName, html, callback) {
  res.render(tplName, {
    'expressFlickrHtml': html
  }, callback);
}


/**
 * Render the received data in one of our templates.
 * This rendered template will be then injected into the user's template.
 * @param  {Object}   res      Response object.
 * @param  {String}   tplName  Name of the template to render
 * @param  {Object}   data     Data to render from the flickr API
 * @param  {Function} callback
 */
function onFlickrResponse (res, tplName, data, callback) {
  renderer.render(tplName, data, callback);
}


/**
 * Render an album (list of images)
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function renderAlbum (req, res, next) {
  async.waterfall([
    flickr.getAlbum.bind(flickr, req.params.albumId),
    onFlickrResponse.bind(null, res, renderer.templates.album),
    renderUserTemplate.bind(null, res, templates.album)
  ], getRenderCallback(res, next));
}


/**
 * Renders the list of albums retreived for this user.
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function renderAlbumList (req, res, next) {
  async.waterfall([
    flickr.getAlbumList.bind(flickr),
    updateLinks,
    onFlickrResponse.bind(null, res, renderer.templates.albumList),
    renderUserTemplate.bind(null, res, templates.albumList)
  ], getRenderCallback(res, next));

  function updateLinks (list, callback) {
    try {
      list.forEach(function (album) {
        album.albumLink = path.join(req.baseUrl, album.albumId);
      });

      callback(null, list);
    } catch (e) {
      callback(e, null);
    }
  }
}
