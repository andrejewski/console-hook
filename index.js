(function() {

var allMethods = ['assert', 'debug', 'dir', 'dirxml', 'error', 'info', 'log', 'table', 'trace', 'warn'];
var supportedMethods = allMethods.filter(function(m) { return typeof console[m] === 'function';});

function Hook(logger, silent) {
  if (!(this instanceof Hook)) {
    return new Hook(logger, silent);
  }
  this.hooks = {}; // method: [hooks]
  this.refs = {}; // method: original console[method]
  this.isDispatching = false;
  this.logger = logger || console;
  this.silent = silent || false;
}

Hook.prototype.attach = function attach(method, hook) {
  if (typeof method !== 'string') {
    hook = method;
    supportedMethods.forEach(function(method) {
      this.attach(method, hook);
    }, this);
    return this;
  }

  if (this.hooks[method]) {
    this.hooks[method].push(hook);
  } else {
    this.hooks[method] = [hook];
    this.override(method);
  }
  return this;
}

Hook.prototype.detach = function detach(method, hook) {
  if (!method) {
    supportedMethods.forEach(function(method) {
      if (this.refs[method]) {
        this.detach(method);
      }
    }, this);
    return this;
  }

  if (hook) {
    this.hooks[method] = this.hooks[method]
      .filter(function(h) {return h !== hook;});
  } else {
    this.hooks[method] = [];
  }
  if (!this.hooks.length) {
    this.restore(method);
  }
  return this;
}

Hook.prototype.override = function override(method) {
  if (this.refs[method]) return;
  this.refs[method] = this.logger[method];
  var self = this;
  this.logger[method] = function() {
    if (!self.isDispatching) {
      var args = [method, arguments];
      self.isDispatching = true;
      self.hooks[method].forEach(function(hook) {
        hook.apply(this, args);
      }, this);
      self.isDispatching = false;
    }
    if (!self.silent) {
      var func = self.refs[method];
      if (func.apply) {
        func.apply(this, arguments);
      } else {
        // some IE's don't have .apply() on native functions
        var message = Array.prototype.slice.apply(arguments).join(' ')
        func.call(this, message);
      }
    }
  }
}

Hook.prototype.restore = function restore(method) {
  this.logger[method] = this.refs[method];
  delete this.refs[method];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Hook;
} else if (typeof window !== 'undefined') {
  window.ConsoleHook = Hook;
} else {
  this.ConsoleHook = Hook;
}

}).call(this);
