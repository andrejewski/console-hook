var assert = require('assert');
var Hook = require('..');

function mockLogger() {
  var logs = [];
  var warns = [];
  return {
    logs: logs,
    log: function(message) {
      logs.push(message);
    },
    warns: warns,
    warn: function warn(message) {
      warns.push(message);
    }
  };
}

describe('console-hook', function() {
  describe('constructor(logger, silent)', function() {
    it('should use the passed logger if provided', function() {
      var logger = mockLogger();
      var message = 'test';
      var hook = Hook(logger).attach('log', function(method, args) {
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.equal(logger.logs[0], message);
    });

    it('should use the default console if no logger is provided', function() {
      var message = '      ✓ *console output worked*';
      var hook = Hook().attach(function(method, args) {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
      });

      console.log(message);
      hook.detach();
    });

    it('should not call underlying logger methods if silent', function() {
      var logger = mockLogger();
      var message = 'test';
      var hook = Hook(logger, true).attach('log', function(method, args) {
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.equal(logger.logs.length, 0);
    });
  });

  describe('attach(method, hook)', function() {
    it('should add the hook to the method', function() {
      var logger = mockLogger();
      var message = 'test';
      var hookCalls = 0;
      var hook = Hook(logger).attach('log', function(method, args) {
        hookCalls++;
        assert.equal(method, 'log');
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.deepEqual(logger.logs, [message]);
      assert.equal(hookCalls, 1);
    });

    it('should add the hook to all methods is method is not provided', function() {
      var methods = ['log', 'warn'];
      var messages = ['test1', 'test2'];
      var logger = mockLogger();
      var hookCalls = 0;
      var hook = Hook(logger).attach(function(method, args) {
        assert.equal(method, methods[hookCalls]);
        assert.equal(args[0], messages[hookCalls]);
        hookCalls++;
      });

      logger.log(messages[0]);
      logger.warn(messages[1]);
      assert.deepEqual(logger.logs, ['test1']);
      assert.deepEqual(logger.warns, ['test2']);
      assert.equal(hookCalls, 2);
    });

    it('should return itself', function() {
      var hook = Hook(mockLogger());
      assert.equal(hook, hook.attach(function(method, args) {return void 0;}));
    });
  });

  describe('detach(method, hook)', function() {
    it('should remove the hook from the method', function() {
      var logger = mockLogger();
      var hookCalls = 0;
      var handle = function() { return hookCalls++; };
      var hook = Hook(logger).attach('log', handle);

      logger.log('a');
      hook.detach('log', handle);
      logger.log('b');

      assert.equal(hookCalls, 1);
    });

    it('should remove all hooks from method if hook is not provided', function() {
      var logger = mockLogger();
      var hook1Calls = 0;
      var hook2Calls = 0;
      var handle1 = function() { return hook1Calls++; };
      var handle2 = function() { return hook2Calls++; };
      var hook = Hook(logger)
        .attach('log', handle1)
        .attach('log', handle2);

      logger.log('a');
      hook.detach('log');
      logger.log('b');

      assert.deepEqual(logger.logs, ['a', 'b']);
      assert.equal(hook1Calls, 1);
      assert.equal(hook2Calls, 1);
    });

    it('should remove all hooks from all methods if nothing is provided', function() {
      var logger = mockLogger();
      var hook1Calls = 0;
      var hook2Calls = 0;
      var handle1 = function() { return hook1Calls++; };
      var handle2 = function() { return hook2Calls++; };
      var hook = Hook(logger)
        .attach('log', handle1)
        .attach(handle2);

      logger.log('a');
      hook.detach();
      logger.log('b');

      assert.deepEqual(logger.logs, ['a', 'b']);
      assert.equal(hook1Calls, 1);
      assert.equal(hook2Calls, 1);
    });

    it('should return itself', function() {
      var hook = Hook(mockLogger());
      assert.equal(hook, hook.detach());
    });
  });

  it('should call hooks if a method on the logger is called', function() {
    var logger = mockLogger();
    var message = 'test';
    var globalHookCalled = false;
    var logHookCalled = false;
    var hook = Hook(logger)
      .attach(/* global */ function(method, args) {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
        globalHookCalled = true;
      })
      .attach('log', function(method, args) {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
        logHookCalled = true;
      });

    logger.log(message);
    assert.equal(logger.logs.length, 1);
    assert.ok(globalHookCalled);
    assert.ok(logHookCalled);
  });

  it('should not call hooks within a hook', function() {
    var logger = mockLogger();
    var message = 'test';
    var message2 = 'noop';
    var hook = Hook(logger).attach(function(method, args) {
      assert.equal(method, 'log');
      assert.equal(args[0], message);
      logger.log(message2);
    });
    logger.log(message);
    assert.deepEqual(logger.logs, [message2, message]);
  });
});
