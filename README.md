# collapse-prototypes

[![Greenkeeper badge](https://badges.greenkeeper.io/kellyselden/collapse-prototypes.svg)](https://greenkeeper.io/)

[![npm version](https://badge.fury.io/js/collapse-prototypes.svg)](https://badge.fury.io/js/collapse-prototypes)
[![Build Status](https://travis-ci.org/kellyselden/collapse-prototypes.svg?branch=master)](https://travis-ci.org/kellyselden/collapse-prototypes)
[![Build status](https://ci.appveyor.com/api/projects/status/ojx0e1dmu7nousgb/branch/master?svg=true)](https://ci.appveyor.com/project/kellyselden/collapse-prototypes/branch/master)

Return an object with prototype properties included as own properties (for serialization purposes)

### Example

```js
import collapse from 'collapse-prototypes';

let parent = {
  foo: 1
};

let child = Object.create(parent);

child.bar = 2;

let collapsed = collapse(child);

console.log(collapsed); // { foo: 1, bar: 2 }
```

### Installation

```sh
yarn add collapse-prototypes
```

### API

```js
collapse(obj, {
  // useful if you're going to serialize, because `toJSON` and getters
  // may not like the new prototype-less object
  // Default value (false)
  stripFunctions: true,
  
  // speeds up collapsing if you don't need them
  // Default value (false)
  excludeNonenumerable: true,
  
  // useful if you're going to stringify (uses `json-stringify-safe`)
  // Default value (false)
  dropCycles: true,
  
  // prepend the debug log to differentiate calls using the `debug` package
  // (DEBUG=collapse-prototypes)
  // Default value ('')
  debugLabel: 'obj'
});
```
