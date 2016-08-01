const assert = require('assert');
const Hook = require('..');

function mockLogger() {
  const logs = [];
  const warns = [];
  return {
    logs,
    log(message) {
      logs.push(message);
    },
    warns,
    warn(message) {
      warns.push(message);
    }
  };
}

describe('console-hook', () => {
  describe('constructor(logger, silent)', () => {
    it('should use the passed logger if provided', () => {
      const logger = mockLogger();
      const message = 'test';
      const hook = Hook(logger).attach('log', (method, args) => {
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.equal(logger.logs[0], message);
    });

    it('should use the default console if no logger is provided', () => {
      const message = '      ✓ *console output worked*';
      const hook = Hook().attach((method, args) => {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
      });

      console.log(message);
      hook.detach();
    });

    it('should not call underlying logger methods if silent', () => {
      const logger = mockLogger();
      const message = 'test';
      const hook = Hook(logger, true).attach('log', (method, args) => {
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.equal(logger.logs.length, 0);
    });
  });

  describe('attach(method, hook)', () => {
    it('should add the hook to the method', () => {
      const logger = mockLogger();
      const message = 'test';
      var hookCalls = 0;
      const hook = Hook(logger).attach('log', (method, args) => {
        hookCalls++;
        assert.equal(method, 'log');
        assert.equal(args[0], message);
      });

      logger.log(message);
      assert.deepEqual(logger.logs, [message]);
      assert.equal(hookCalls, 1);
    });

    it('should add the hook to all methods is method is not provided', () => {
      const methods = ['log', 'warn'];
      const messages = ['test1', 'test2'];
      const logger = mockLogger();
      var hookCalls = 0;
      const hook = Hook(logger).attach((method, args) => {
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

    it('should return itself', () => {
      const hook = Hook(mockLogger());
      assert.equal(hook, hook.attach((method, args) => void 0));
    });
  });

  describe('detach(method, hook)', () => {
    it('should remove the hook from the method', () => {
      const logger = mockLogger();
      var hookCalls = 0;
      const handle = () => hookCalls++;
      const hook = Hook(logger).attach('log', handle);

      logger.log('a');
      hook.detach('log', handle);
      logger.log('b');

      assert.equal(hookCalls, 1);
    });

    it('should remove all hooks from method if hook is not provided', () => {
      const logger = mockLogger();
      var hook1Calls = 0;
      var hook2Calls = 0;
      const handle1 = () => hook1Calls++;
      const handle2 = () => hook2Calls++;
      const hook = Hook(logger)
        .attach('log', handle1)
        .attach('log', handle2);

      logger.log('a');
      hook.detach('log');
      logger.log('b');

      assert.deepEqual(logger.logs, ['a', 'b']);
      assert.equal(hook1Calls, 1);
      assert.equal(hook2Calls, 1);
    });

    it('should remove all hooks from all methods if nothing is provided', () => {
      const logger = mockLogger();
      var hook1Calls = 0;
      var hook2Calls = 0;
      const handle1 = () => hook1Calls++;
      const handle2 = () => hook2Calls++;
      const hook = Hook(logger)
        .attach('log', handle1)
        .attach(handle2);

      logger.log('a');
      hook.detach();
      logger.log('b');

      assert.deepEqual(logger.logs, ['a', 'b']);
      assert.equal(hook1Calls, 1);
      assert.equal(hook2Calls, 1);
    });

    it('should return itself', () => {
      const hook = Hook(mockLogger());
      assert.equal(hook, hook.detach());
    });
  });

  it('should call hooks if a method on the logger is called', () => {
    const logger = mockLogger();
    const message = 'test';
    var globalHookCalled = false;
    var logHookCalled = false;
    const hook = Hook(logger)
      .attach(/* global */ (method, args) => {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
        globalHookCalled = true;
      })
      .attach('log', (method, args) => {
        assert.equal(method, 'log');
        assert.equal(args[0], message);
        logHookCalled = true;
      });

    logger.log(message);
    assert.equal(logger.logs.length, 1);
    assert.ok(globalHookCalled);
    assert.ok(logHookCalled);
  });

  it('should not call hooks within a hook', () => {
    const logger = mockLogger();
    const message = 'test';
    const message2 = 'noop';
    const hook = Hook(logger).attach((method, args) => {
      assert.equal(method, 'log');
      assert.equal(args[0], message);
      logger.log(message2);
    });
    logger.log(message);
    assert.deepEqual(logger.logs, [message2, message]);
  });
});
