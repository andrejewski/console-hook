# Console Hook

Hook into the `console` for transparent log recording in production and log capture for testing.

```sh
npm install console-hook
```

Works in the browser too, just grab `console-hook/index.js`.

## Examples

### Intercept all `console` method calls

```js
var Hook = require('console-hook');
var myHook = Hook().attach((method, args) => {
  // method is the console[method] string
  // args is the arguments object passed to console[method]
});

// okay, we're done playing with the console stuffs
myHook.detach();
```

### Intercept all `console` method calls and don't call `console`

```js
var Hook = require('console-hook');
var silence = true; // could be `isProduction`
var myHook = Hook(console, silence).attach((method, args) => {
  // method is the console[method] string
  // args is the arguments object passed to console[method]
});

// okay, we're done playing with the console stuffs
myHook.detach();
```

### Intercept only `console.error` calls

```js
var Hook = require('console-hook');
var myHook = Hook().attach('error', (method, args) => {
  // method is the console[method] string, always "error"
  // args is the arguments object passed to console[method]
});

// okay, we're done playing with the console stuffs
myHook.detach();
```

### Use another `console`-like Logger

```js
// if you have an Ember app and already use Ember.Logger
var Hook = require('console-hook');
var myHook = Hook(Ember.Logger).attach((method, args) => {
  // method is the console[method] string, always "error"
  // args is the arguments object passed to console[method]
});

// okay, we're done playing with the console stuffs
myHook.detach();
```

## Contributing

Contributions are incredibly welcome as long as they are standardly applicable
and pass the tests (or break bad ones). Tests are written in Mocha and
assertions are done with the Node.js core `assert` module.

```bash
# running tests
npm run test
```

Follow me on [Twitter](https://twitter.com/compooter) for updates or just for
the lolz and please check out my other [repositories](https://github.com/andrejewski)
 if I have earned it. I thank you for reading.
