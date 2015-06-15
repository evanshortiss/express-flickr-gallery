'use strict';

var jade = require('jade')
  , path = require('path')
  , xtend = require('xtend')
  , templates = exports.templates = {};

var options = {
  classNames: {
    col: 'col-xs-4',
    row: 'row',
    container: 'container-fluid'
  }
};

// Prepare our templates
[
  {
    filename: 'express-flickr-album',
    type: 'album'
  },
  {
    filename: 'express-flickr-album-list',
    type: 'albumList'
  }
].forEach(loadTpl);


/**
 * Load a template based on its name
 * @param {Object} tpl  Template config
 */
function loadTpl (tpl) {
  var tplPath = path.join(__dirname, '../views', tpl.filename.concat('.jade'));

  templates[tpl.type] = {
    filename: tpl.filename,
    type: tpl.type,
    path: path,
    fn: jade.compileFile(tplPath, {})
  };
}


/**
 * Allows user to override renderer defaults such as columns per row
 * classes used etc.
 * @param {Object} opts
 */
exports.setOptions = function (opts) {
  if (opts) {
    // Override existing options with those specified
    options = xtend(options, opts);
  }
};


/**
 * Render the given template name with the provided data
 * @param  {Object}   tpl      Template to use for this rendering.
 * @param  {Object}   data     Data to pass to the template
 * @param  {Function} callback [description]
 */
exports.render = function (tpl, data, callback) {
  try {
    callback(
      null,
      tpl.fn({
        options: options,
        data: data
      })
    );
  } catch (e) {
    callback(e, null);
  }
};
