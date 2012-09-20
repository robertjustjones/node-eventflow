var eventflow = require('../'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert');

eventflow(EventEmitter);

describe('countArgs()', function () {

  it('should return 0 for a function with no arguments', function () {
    function zero () {}
    assert.equal(eventflow.countArgs(zero), 0);
  });

  it('should return 1 for a function with one argument', function () {
    function one (foo) {}
    assert.equal(eventflow.countArgs(one), 1);
  });

  it('should return 5 for a function with five arguments', function () {
    function five (foo, bar, baz,boo, far) {}
    assert.equal(eventflow.countArgs(five), 5);
  });

});

describe('series', function() {
  var emitter, result;

  beforeEach(function() {
    emitter = new EventEmitter();
    result = [];
  });

  it('should run handlers in series', function (done) {
    emitter.on('foo', function () {
      result.push('a');
    });

    emitter.on('foo', function (cb) {
      result.push('b');
      cb();
    });

    emitter.on('foo', function () {
      result.push('c');
    });

    emitter.series('foo', function () {
      assert.equal(result[0], 'a');
      assert.equal(result[1], 'b');
      assert.equal(result[2], 'c');
      done();
    });
  });

  it('should run handlers in a series with arguments', function (done) {
    emitter.on('bar', function (a, b) {
      result.push(a);
      result.push(b);
    });

    emitter.on('bar', function (a, b, cb) {
      result.push(a);
      result.push(b);
      cb();
    });

    emitter.series('bar', 'foo', 'baz', function () {
      assert.equal(result[0], 'foo');
      assert.equal(result[1], 'baz');
      assert.equal(result[2], 'foo');
      assert.equal(result[3], 'baz');
      done();
    });
  });

  it('should support optional use of `results`', function (done) {
    emitter.on('fruit', function (cb) {
      cb(null, 'apple');
    });
    emitter.on('fruit', function () {
      return 'orange';
    });
    emitter.series('fruit', function (err, results) {
      assert.ifError(err);
      assert.equal(results[0], 'apple');
      assert.equal(results[1], 'orange');
      done();
    });
  });

  it('should support optional use of `error`', function (done) {
    emitter.on('drink', function () {
      result.push('coke');
    });
    emitter.on('drink', function (cb) {
      cb('oh no!');
    });
    emitter.on('drink', function () {
      result.push('pepsi');
    });
    emitter.series('drink', function (err) {
      assert(result[0], 'coke');
      assert(result.length, 1);
      assert(err, 'oh no!');
      done();
    });
  });

});


describe('parallel', function () {
  var emitter, result;

  beforeEach(function () {
    emitter = new EventEmitter();
    result = {};
  });

  it('should run handlers in parallel', function (done) {
    emitter.on('candy', function () {
      result.sour = 'Sour Patch';
    });
    emitter.on('candy', function (cb) {
      result.hard = 'Jolly Rancher';
      cb();
    });
    emitter.parallel('candy', function () {
      assert.equal(result.sour, 'Sour Patch');
      assert.equal(result.hard, 'Jolly Rancher');
      done();
    });
  });

});