# WIP: immutable-prop-types

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm package](https://img.shields.io/npm/v/immutable-prop-types.svg?style=flat)](https://www.npmjs.org/package/immutable-prop-types)
[![Build Status](https://travis-ci.org/ztoben/immutable-prop-types.svg?branch=master)](https://travis-ci.org/ztoben/immutable-prop-types)


PropType validators that work with Immutable.js. Forked from [react-immutable-proptypes](https://github.com/HurricaneJames/react-immutable-proptypes).

## About

Usage is simple, they work with and like any `PropType.*` validator. Not yet feature complete, working on a rewrite in my spare time.

```js
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'immutable-prop-types';
class MyReactComponent extends React.Component {
  // ...
}

MyReactComponent.propTypes = {
  myRequiredImmutableList: ImmutablePropTypes.listOf(
    ImmutablePropTypes.contains({
      someNumberProp: PropTypes.number.isRequired
    })
  ).isRequired
};
```

Convenience helpers for "primitive" Immutable.js objects:

```js
propTypes: {
  oldListTypeChecker: PropTypes.instanceOf(Immutable.List),
  anotherWay: ImmutablePropTypes.list,
  requiredList: ImmutablePropTypes.list.isRequired,
  mapsToo: ImmutablePropTypes.map,
  evenIterable: ImmutablePropTypes.iterable
}
```

## Installation

Installing via [npmjs](https://www.npmjs.com/package/immutable-prop-types)
```bash
npm install --save immutable-prop-types
```

## API

Immutable prop types has:
* Primitive Types
```js
ImmutablePropTypes.list         // Immutable.List.isList
ImmutablePropTypes.map          // Immutable.Map.isMap
ImmutablePropTypes.orderedMap   // Immutable.OrderedMap.isOrderedMap
ImmutablePropTypes.set          // Immutable.Set.isSet
ImmutablePropTypes.orderedSet   // Immutable.OrderedSet.isOrderedSet
ImmutablePropTypes.stack        // Immutable.Stack.isStack
ImmutablePropTypes.seq          // Immutable.Seq.isSeq
ImmutablePropTypes.iterable     // Immutable.Iterable.isIterable
ImmutablePropTypes.record       // instanceof Record
ImmutablePropTypes.contains     // Immutable.Iterable.isIterable - contains(shape)
ImmutablePropTypes.mapContains  // Immutable.Map.isMap - contains(shape)
```

* `ImmutablePropTypes.contains` (formerly `shape`) is based on `PropTypes.shape` and will try to work with any `Immutable.Iterable`. In my usage it is the most used validator, as I'm often trying to validate that a map has certain properties with certain values.

```es6
// ...
aMap: ImmutablePropTypes.contains({
  aList: ImmutablePropTypes.contains({
    0: PropTypes.number,
    1: PropTypes.string,
    2: PropTypes.number.isRequired,
  }).isRequired,
})
// ...
<SomeComponent aList={Immutable.fromJS({aList: [1, 'two', 3]})} />
```

* `ImmutablePropTypes.listOf` is based on `PropTypes.array` and is specific to `Immutable.List`.

* `ImmutablePropTypes.mapOf` allows you to control both map values and keys (in Immutable.Map, keys could be _anything_ including another Immutable collections). It accepts two arguments - first one for values, second one for keys (optional). If you are interested in validation of keys only, just pass `PropTypes.any` as the first argument.

```es6
// ...
aMap: ImmutablePropTypes.mapOf(
  PropTypes.any, // validation for values
  ImmutablePropTypes.mapContains({ // validation for keys
    a: PropTypes.number.isRequired,
    b: PropTypes.string
  })
)
// ...
const aMap = Immutable.Map([
  [Immutable.Map({a: 1, b: '2'}), 'foo'],
  [Immutable.Map({a: 3}), [1, '2', 3]]
]);
<SomeComponent aMap={aMap} />
```

* `ImmutablePropTypes.orderedMapOf` is basically the same as `mapOf`, but it is specific to `Immutable.OrderedMap`.

* `ImmutablePropTypes.orderedSetOf` is basically the same as `listOf`, but it is specific to `Immutable.OrderedSet`.

* `ImmutablePropTypes.stackOf` is basically the same as `listOf`, but it is specific to `Immutable.Stack`.

* `ImmutablePropTypes.iterableOf` is the generic form of listOf/mapOf. It is useful when there is no need to validate anything other than Immutable.js compatible (ie. `Immutable.Iterable`). Continue to use `listOf` and/or `mapOf` when you know the type.

* `ImmutablePropTypes.recordOf` is like `contains`, except it operates on Record properties.

```js
// ...
aRecord: ImmutablePropTypes.recordOf({
  keyA: PropTypes.string,
  keyB: ImmutablePropTypes.list.isRequired
})
// ...
```

* `ImmutablePropTypes.mapContains` is based on `PropTypes.shape` and will only work with `Immutable.Map`.

```es6
// ...
aMap: ImmutablePropTypes.mapContains({
  aList: ImmutablePropTypes.list.isRequired,
})
// ...
<SomeComponent aList={Immutable.fromJS({aList: [1, 2]})} />
```

These two validators cover the output of `Immutable.fromJS` on standard JSON data sources.
