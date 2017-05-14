'use strict';

const { getSerialize } = require('json-stringify-safe');
const debug = require('debug')('collapse-prototypes');

function createContext({
  stripFunctions,
  getNonenumerable,
  dropCycles,
  debugLabel
} = {}) {
  function getAllPropertyNames(obj) {
    let allNames = [];

    do {
      let names;
      if (getNonenumerable) {
        names = time('ownNames', () => Object.getOwnPropertyNames(obj));
      } else {
        names = time('keys', () => Object.keys(obj));
      }
      allNames = time('concat', () => allNames.concat(names));
      // time('concat', () => {
      //   for (let name of names) {
      //     allNames.push(name);
      //   }
      // });
      obj = time('proto', () => Object.getPrototypeOf(obj));
    } while (obj);

    return allNames;
  }

  let cycleFound;
  let decycler;
  if (!dropCycles) {
    decycler = function(key, value) {
      cycleFound = true;
      return value;
    };
  }

  let serialize = getSerialize(null, decycler);

  function decycle(newObj, obj, key) {
    // We already crawl up the prototype chain using `Object.getPrototypeOf`
    // (from `getallpropertynames`), so crawling the `__proto__` puts us in a
    // weird state when `defineGetter` tries to use internal members.
    // For example:
    // `Cannot read property \'encrypted\' of undefined` at
    // https://github.com/expressjs/express/blob/4.15.2/lib/request.js#L307
    if (key === '__proto__') {
      return;
    }

    let value = obj[key];

    // Since we clobber the prototype chain, any functions that inspect
    // the prototype will act unexpectedly. For example:
    // `Method Date.prototype.valueOf called on incompatible receiver [object Object]`
    if (stripFunctions && typeof value === 'function') {
      return;
    }

    cycleFound = false;
    value = time('serialize', () => serialize.call(obj, key, value));
    if (!cycleFound) {
      value = collapse(value);
    }

    newObj[key] = value;
  }

  function collapse(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    let newObj;

    // if (time('array', () => obj instanceof Array)) {
    if (time('array', () => Array.isArray(obj))) {
      newObj = [];
      for (let i in obj) {
        decycle(newObj, obj, i);
      }
    } else {
      newObj = Object.create(null);
      for (let key of time('allNames', () => getAllPropertyNames(obj))) {
        decycle(newObj, obj, key);
      }
    }

    return newObj;
  }

  return function(obj) {
    times.collapse = 0;
    times.serialize = 0;
    times.array = 0;
    times.allNames = 0;
    times.ownNames = 0;
    times.keys = 0;
    times.concat = 0;
    times.proto = 0;

    let result = time('collapse', () => collapse(obj));

    let log = getLog(debugLabel);
    log('collapse', times.collapse);
    log('serialize', times.serialize);
    log('array', times.array);
    log('getAllPropertyNames', times.allNames);
    if (times.ownNames) {
      log('getOwnPropertyNames', times.ownNames);
    }
    if (times.keys) {
      log('keys', times.keys);
    }
    if (times.concat) {
      log('concat', times.concat);
    }
    if (times.proto) {
      log('getPrototypeOf', times.proto);
    }

    return result;
  };
}

let times = {};

function time(key, func) {
  let hrtime = process.hrtime();
  let result = func();
  times[key] += getSeconds(process.hrtime(hrtime));
  return result;
}

function getSeconds(diff) {
  return diff[0] + diff[1] / 1000000000;
}

function getLog(debugLabel) {
  let prefix = debugLabel ? `${debugLabel} - ` : '';

  return function(label, s) {
    let ms = s * 1000;
    debug(`${prefix}${label} took ${s.toFixed(9)} seconds (${ms.toFixed(6)} ms)`);
  };
}

module.exports = function(obj, options) {
  return createContext(options)(obj);
};
