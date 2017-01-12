let assert = require('assert'),
    before = require('./before.js');

describe('middleware/meta/before', function () {

    it('works without collection id', function (done) {

        let req = {
            params: {
                metaCollectionName: 'collections',
                metaCollectionId: null
            }
        };

        before(req, {}, function () {
            assert.notEqual(req.model, undefined);
            assert.equal(req.url,
                `/api/collections/jangle.${req.params.metaCollectionName}`);
            done();
        });

    });

    it('works with collection id', function (done) {

        let req = {
            params: {
                metaCollectionName: 'collections',
                metaCollectionId: 'example'
            }
        };

        before(req, {}, function () {
            assert.notEqual(req.model, undefined);
            assert.equal(req.url,
                `/api/collections/jangle.${req.params.metaCollectionName}/${req.params.metaCollectionId}`
            );
            done();
        });

    });

});
