'use strict';

const { describe } = require('./helpers/mocha');
const { expect } = require('./helpers/chai');
const collapse = require('..');

const firstObj = Object.create(null, {
  bar1: {
    value: 2
  },
  baz1: {
    value: 3,
    enumerable: true
  }
});

const secondObj = Object.create(firstObj, {
  bar2: {
    value: 2
  },
  baz2: {
    value: undefined,
    enumerable: true
  },
  foo1: {
    value: firstObj
  }
});

const thirdObj = Object.create(secondObj, {
  bar3: {
    value: 'a'
  },
  baz3: {
    value: null,
    enumerable: true
  },
  foo2: {
    value: [firstObj, secondObj]
  }
});

secondObj.thirdObj = thirdObj;

describe(function() {
  it('collapse', function() {
    let actual = thirdObj;

    let expected = {
      bar1: 2,
      baz1: 3,
      bar2: 2,
      baz2: undefined,
      bar3: 'a',
      baz3: null,
      foo1: {
        bar1: 2,
        baz1: 3
      },
      foo2: [
        {
          bar1: 2,
          baz1: 3
        },
        {
          bar1: 2,
          baz1: 3,
          bar2: 2,
          baz2: undefined,
          foo1: {
            bar1: 2,
            baz1: 3
          },
          thirdObj: '[Circular ~.baz3]'
        }
      ],
      thirdObj: '[Circular ~.baz3]'
    };

    // let expected = {
    //   bar1: 2,
    //   baz1: 3,
    //   bar2: 2,
    //   baz2: undefined,
    //   bar3: 'a',
    //   baz3: null,
    //   foo1: {
    //     bar1: 2,
    //     baz1: 3
    //   },
    //   foo2: [
    //     {
    //       bar1: 2,
    //       baz1: 3
    //     },
    //     {
    //       bar1: 2,
    //       baz1: 3,
    //       bar2: 2,
    //       baz2: undefined,
    //       foo1: {
    //         bar1: 2,
    //         baz1: 3
    //       },
    //       thirdObj: {
    //         bar1: 2,
    //         baz1: 3,
    //         bar2: 2,
    //         baz2: undefined,
    //         bar3: 'a',
    //         baz3: null,
    //         foo1: {
    //           bar1: 2,
    //           baz1: 3
    //         },
    //         foo2: '[Circular ~]',
    //         thirdObj: '[Circular ~.1.thirdObj]'
    //       }
    //     }
    //   ],
    //   thirdObj: '[Circular ~.1.thirdObj]'
    // };

    expect(collapse(actual, { dropCycles: true })).to.deep.equal(expected);
  });

  it('collapse without functions', function() {
    let actual = Object.create(null);

    function func() {}

    actual.func = func;

    let expected = {
    };

    expect(collapse(actual, { stripFunctions: true })).to.deep.equal(expected);
  });

  it('collapse with functions', function() {
    let actual = Object.create(null);

    function func() {}

    actual.func = func;

    let expected = {
      func
    };

    expect(collapse(actual)).to.deep.equal(expected);
  });
});
