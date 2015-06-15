'use strict';

var flickr = require('../index.js').api
  , expect = require('chai').expect;

describe('flickr.js - Wrapped API Functions', function () {

  this.timeout(40000);

  before(function (done) {
    var opts = {
      api_key: process.env.FLICKR_API_KEY,
      secret: process.env.FLICKR_SECRET,
      user_id: process.env.FLICKR_USER_ID
    };

    flickr.init(opts, done);
  });

  describe('getAlbumList', function () {

    it('Should get the the album list for the set ENV VARS', function (done) {
      flickr.getAlbumList(function (err, list) {
        expect(err).to.be.null;
        expect(list).to.be.an.array;
        done();
      });
    });

  });

  describe('getAlbum', function () {
    it('Should get list of images in an album and the title', function (done) {
      flickr.getAlbumList(function (err, list) {
        expect(err).to.be.null;
        expect(list).to.be.an.array;

        expect(list).length.to.be.at.least(1);

        flickr.getAlbum(list[0].albumId, function(err, res) {
          expect(err).to.be.null;
          expect(res).to.be.an.object;
          expect(res.title).to.be.a.string
          expect(res.images).to.be.an.array;
          done();
        });
      });
    });
  });

});
