'use strict';

var FlickrAPI = require('flickrapi')
  , flickrurl = require('flickr-urls')
  , cache = require('memory-cache')
  , async = require('async')
  , util = require('util')
  , _ = require('lodash')
  , flickr = null
  , permittedAlbums = []
  , cache_expiry = null
  , opts = {};

var SETS_CACHE_KEY = 'sets'
  , DEFAULT_CACHE_EXPIRY = (60 * 5 * 1000) // 5 minutes
  , ALBUM_CACHE_KEY = 'album';

/**
 * Initialise the flickr API wrapper for use by client requests.
 * @param  {Function} callback
 */
exports.init = function (fopts, callback) {
  opts = fopts;

  var missingOpt = _.find(['api_key', 'secret', 'user_id'], function (o) {
    return (typeof opts[o] === 'undefined');
  });

  if (missingOpt) {
    var e = util.format('Options was missing "%s" key', missingOpt);
    return callback(new Error(e), null);
  }

  cache_expiry = fopts['cache_expiry'] ||  DEFAULT_CACHE_EXPIRY;

  // Used to determine if albums should be filtered or not
  permittedAlbums = fopts.albums || permittedAlbums;

  function onInit (err, inst) {
    if (!err) {
      flickr = inst;
    }
    callback(err, null);
  }

  FlickrAPI.tokenOnly({
    api_key: opts['api_key'],
    secret: opts['secret']
  }, onInit);
};


/**
 * Return
 * @return {[type]} [description]
 */
function filterAlbums (albums) {
  if (permittedAlbums.length === 0) {
    return albums;
  } else {
    return _.filter(albums, function (a) {
      return (permittedAlbums.indexOf(a.albumId) !== -1);
    });
  }
}


/**
 * Get the album list for the configured ENV
 * Each set will be represented by a custom object with the
 * name, description, albumId and coverUrl
 * @param  {Function} callback
 * @return {Array}
 */
exports.getAlbumList = function (callback) {
  if (cache.get(SETS_CACHE_KEY)) {
    callback(null, cache.get(SETS_CACHE_KEY));
  } else {
    async.waterfall([
      flickr.photosets.getList.bind(flickr, {
        user_id: opts['user_id']
      }),
      onSetsLoaded
    ], callback);
  }

  function convertSet (s) {
    return {
      albumId: s['id'],
      name: s['title']['_content'],
      desc: s['description']['_content'],
      coverUrl: flickrurl.getFarmUrl({
        server: s['server'],
        secret: s['secret'],
        id: s['primary'],
        farm: s['farm'],
        size: flickrurl.IMG_SIZES.LARGE_1024
      })
    };
  }

  function onSetsLoaded (sets, next) {
    try {
      sets = _.map(sets['photosets']['photoset'], convertSet);
      sets = filterAlbums(sets);

      cache.put(SETS_CACHE_KEY, sets, cache_expiry);

      next(null, sets);
    } catch (e) {
      next(e, null);
    }
  }
};


/**
 * Get the data related to an album with the given id
 * @param {String}
 * @param {Function} callback
 */
exports.getAlbum = function (albumId, callback) {
  if (cache.get(getAlbumCacheKey())) {
    callback(null, cache.get(getAlbumCacheKey()));
  } else {
    flickr.photosets.getPhotos({
      photoset_id: albumId,
      user_id: opts['user_id']
    }, onPhotosLoaded);
  }

  function getAlbumCacheKey () {
    return ALBUM_CACHE_KEY.concat(albumId);
  }

  function onPhotosLoaded (err, set) {
    if (err) {
      callback(err, null);
    } else {
      try {
        // May need to use async.map in the future if the 1024 size below is
        // not available. This would require a lookup to flickr.photos.getSizes
        // for each image.
        var res = {
          images: _.map(set['photoset']['photo'], convertPhoto),
          title: set['photoset']['title']
        };

        cache.put(getAlbumCacheKey(), res, cache_expiry);

        callback(null, res);
      } catch (e) {
        callback(e, null);
      }
    }
  }

  function convertPhoto (p) {
    return {
      id: p['id'],
      title: p['title'],
      url: flickrurl.getFarmUrl({
        server: p['server'],
        secret: p['secret'],
        id: p['id'],
        farm: p['farm'],
        size: flickrurl.IMG_SIZES.LARGE_1024
      })
    };
  }
};
