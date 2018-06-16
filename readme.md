# immutable-prop-types

[![npm package](https://img.shields.io/npm/v/immutable-prop-types.svg?style=flat)](https://www.npmjs.org/package/immutable-prop-types)
[![Build Status](https://travis-ci.org/ztoben/immutable-prop-types.svg?branch=master)](https://travis-ci.org/ztoben/immutable-prop-types) [![Greenkeeper badge](https://badges.greenkeeper.io/ztoben/immutable-prop-types.svg)](https://greenkeeper.io/)

PropType validators that work with Immutable.js. Forked from [react-immutable-proptypes](https://github.com/HurricaneJames/react-immutable-proptypes).

## About

Usage is simple, they work with and like any `React.PropType.*` validator.

```js
var ImmutablePropTypes = require('react-immutable-proptypes');
var MyReactComponent = React.createClass({
    // ...
    propTypes: {
        myRequiredImmutableList: ImmutablePropTypes.listOf(
            ImmutablePropTypes.contains({
                someNumberProp: React.PropTypes.number.isRequired
            })
        ).isRequired
    }
    // ...
});
```

Since version 0.1.7 there are convenience helpers for "primitive" Immutable.js objects.

```js
propTypes: {
    oldListTypeChecker: React.PropTypes.instanceOf(Immutable.List),
    anotherWay: ImmutablePropTypes.list,
    requiredList: ImmutablePropTypes.list.isRequired,
    mapsToo: ImmutablePropTypes.map,
    evenIterable: ImmutablePropTypes.iterable
}
```


## Installation

Installing via [npmjs](https://www.npmjs.com/package/react-immutable-proptypes)
```bash
npm install --save react-immutable-proptypes
```


## API

React-Immutable-PropTypes has:
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

* `ImmutablePropTypes.contains` (formerly `shape`) is based on `React.PropTypes.shape` and will try to work with any `Immutable.Iterable`. In my usage it is the most used validator, as I'm often trying to validate that a map has certain properties with certain values.

```es6
// ...
aMap: ImmutablePropTypes.contains({
    aList: ImmutablePropTypes.contains({
        0: React.PropTypes.number,
        1: React.PropTypes.string,
        2: React.PropTypes.number.isRequired,
    }).isRequired,
})
// ...
<SomeComponent aList={Immutable.fromJS({aList: [1, 'two', 3]})} />
```

* `ImmutablePropTypes.listOf` is based on `React.PropTypes.array` and is specific to `Immutable.List`.

* `ImmutablePropTypes.mapOf` allows you to control both map values and keys (in Immutable.Map, keys could be _anything_ including another Immutable collections). It accepts two arguments - first one for values, second one for keys (optional). If you are interested in validation of keys only, just pass `React.PropTypes.any` as the first argument.

```es6
// ...
aMap: ImmutablePropTypes.mapOf(
    React.PropTypes.any, // validation for values
    ImmutablePropTypes.mapContains({ // validation for keys
        a: React.PropTypes.number.isRequired,
        b: React.PropTypes.string
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
    keyA: React.PropTypes.string,
    keyB: ImmutablePropTypes.list.isRequired
})
// ...
```

* `ImmutablePropTypes.mapContains` is based on `React.PropTypes.shape` and will only work with `Immutable.Map`.

```es6
// ...
aMap: ImmutablePropTypes.mapContains({
    aList: ImmutablePropTypes.list.isRequired,
})
// ...
<SomeComponent aList={Immutable.fromJS({aList: [1, 2]})} />
```

These two validators cover the output of `Immutable.fromJS` on standard JSON data sources.