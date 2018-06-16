/**
 * This is a straight rip-off of the React.js ReactPropTypes.js proptype validators,
 * modified to make it possible to validate Immutable.js data.
 *     ImmutableTypes.listOf is patterned after React.PropTypes.arrayOf, but for Immutable.List
 *     ImmutableTypes.shape  is based on React.PropTypes.shape, but for any Immutable.Iterable
 */
import checkPropTypes from 'check-prop-types';
var Immutable = require('immutable');

var ANONYMOUS = '<<anonymous>>';

var ImmutablePropTypes;

if (process.env.NODE_ENV !== 'production') {
  ImmutablePropTypes = {
    listOf:       createListOfTypeChecker,
    mapOf:        createMapOfTypeChecker,
    orderedMapOf: createOrderedMapOfTypeChecker,
    setOf:        createSetOfTypeChecker,
    orderedSetOf: createOrderedSetOfTypeChecker,
    stackOf:      createStackOfTypeChecker,
    iterableOf:   createIterableOfTypeChecker,
    recordOf:     createRecordOfTypeChecker,
    shape:        createShapeChecker,
    contains:     createShapeChecker,
    mapContains:  createMapContainsChecker,
    // Primitive Types
    list:       createImmutableTypeChecker('List', Immutable.List.isList),
    map:        createImmutableTypeChecker('Map', Immutable.Map.isMap),
    orderedMap: createImmutableTypeChecker('OrderedMap', Immutable.OrderedMap.isOrderedMap),
    set:        createImmutableTypeChecker('Set', Immutable.Set.isSet),
    orderedSet: createImmutableTypeChecker('OrderedSet', Immutable.OrderedSet.isOrderedSet),
    stack:      createImmutableTypeChecker('Stack', Immutable.Stack.isStack),
    seq:        createImmutableTypeChecker('Seq', Immutable.Seq.isSeq),
    record:     createImmutableTypeChecker('Record', Immutable.Record.isRecord),
    iterable:   createImmutableTypeChecker('Iterable', Immutable.isCollection)
  };
} else {
  var productionTypeChecker = function() {
    invariant(
      false,
      'ImmutablePropTypes type checking code is stripped in production.'
    );
  };
  productionTypeChecker.isRequired = productionTypeChecker;
  var getProductionTypeChecker = function () { return productionTypeChecker };

  ImmutablePropTypes = {
    listOf:       getProductionTypeChecker,
    mapOf:        getProductionTypeChecker,
    orderedMapOf: getProductionTypeChecker,
    setOf:        getProductionTypeChecker,
    orderedSetOf: getProductionTypeChecker,
    stackOf:      getProductionTypeChecker,
    iterableOf:   getProductionTypeChecker,
    recordOf:     getProductionTypeChecker,
    shape:        getProductionTypeChecker,
    contains:     getProductionTypeChecker,
    mapContains:  getProductionTypeChecker,
    // Primitive Types
    list:       productionTypeChecker,
    map:        productionTypeChecker,
    orderedMap: productionTypeChecker,
    set:        productionTypeChecker,
    orderedSet: productionTypeChecker,
    stack:      productionTypeChecker,
    seq:        productionTypeChecker,
    record:     productionTypeChecker,
    iterable:   productionTypeChecker
  };
}

ImmutablePropTypes.iterable.indexed = createIterableSubclassTypeChecker('Indexed', Immutable.isIndexed);
ImmutablePropTypes.iterable.keyed = createIterableSubclassTypeChecker('Keyed', Immutable.isKeyed);

function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    return 'object';
  }
  if (propValue instanceof Immutable.Iterable) {
    return 'Immutable.' + propValue.toSource().split(' ')[0];
  }
  return propType;
}

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName, ...rest) {
    propFullName = propFullName || propName;
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      if (isRequired) {
        return new Error(
          `Required ${location} \`${propFullName}\` was not specified in ` +
          `\`${componentName}\`.`
        );
      }
    } else {
      return validate(props, propName, componentName, location, propFullName, ...rest);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createImmutableTypeChecker(immutableClassName, immutableClassTypeValidator) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if(!immutableClassTypeValidator(propValue)) {
      var propType = getPropType(propValue);
      return new Error(
        `Invalid ${location} \`${propFullName}\` of type \`${propType}\` ` +
        `supplied to \`${componentName}\`, expected \`${immutableClassName}\`.`
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createIterableSubclassTypeChecker(subclassName, validator) {
  return createImmutableTypeChecker(`Iterable.${subclassName}`, (propValue) =>
    Immutable.isCollection(propValue) && validator(propValue)
  );
}

function createIterableTypeChecker(typeChecker, immutableClassName, immutableClassTypeValidator) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!immutableClassTypeValidator(propValue)) {
      var propType = getPropType(propValue);
      return new Error(
        `Invalid ${location} \`${propFullName}\` of type ` +
        `\`${propType}\` supplied to \`${componentName}\`, expected an Immutable.js ${immutableClassName}.`
      );
    }

    if (typeof typeChecker !== 'function') {
      return new Error(
        `Invalid typeChecker supplied to \`${componentName}\` ` +
        `for propType \`${propFullName}\`, expected a function.`
      );
    }

    var propValues = propValue.valueSeq().toArray();
    for (var i = 0, len = propValues.length; i < len; i++) {
      var error = checkPropTypes(typeChecker, propValues[i], 'prop', componentName);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createKeysTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName, ...rest) {
    var propValue = props[propName];
    if (typeof typeChecker !== 'function') {
      return new Error(
          `Invalid keysTypeChecker (optional second argument) supplied to \`${componentName}\` ` +
          `for propType \`${propFullName}\`, expected a function.`
      );
    }

    var keys = propValue.keySeq().toArray();
    for (var i = 0, len = keys.length; i < len; i++) {
      var error = checkPropTypes(typeChecker, keys[i], 'prop', componentName);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createListOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, 'List', Immutable.List.isList);
}

function createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, immutableClassName, immutableClassTypeValidator) {
  function validate(...args) {
    return createIterableTypeChecker(valuesTypeChecker, immutableClassName, immutableClassTypeValidator)(...args)
        || keysTypeChecker && createKeysTypeChecker(keysTypeChecker)(...args)
  }

  return createChainableTypeChecker(validate);
}

function createMapOfTypeChecker(valuesTypeChecker, keysTypeChecker) {
  return createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, 'Map', Immutable.Map.isMap);
}

function createOrderedMapOfTypeChecker(valuesTypeChecker, keysTypeChecker) {
  return createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, 'OrderedMap', Immutable.OrderedMap.isOrderedMap);
}

function createSetOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, 'Set', Immutable.Set.isSet);
}

function createOrderedSetOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, 'OrderedSet', Immutable.OrderedSet.isOrderedSet);
}

function createStackOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, 'Stack', Immutable.Stack.isStack);
}

function createIterableOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, 'Iterable', Immutable.isCollection);
}

function createRecordOfTypeChecker(recordKeys) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!(propValue instanceof Immutable.Record)) {
      var propType = getPropType(propValue);
      return new Error(
        `Invalid ${location} \`${propFullName}\` of type \`${propType}\` ` +
        `supplied to \`${componentName}\`, expected an Immutable.js Record.`
      );
    }
    for (var key in recordKeys) {
      var checker = recordKeys[key];
      var mutablePropValue = propValue.toObject();
      var error = checkPropTypes(checker, mutablePropValue, 'prop', componentName);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes, immutableClassName = 'Iterable', immutableClassTypeValidator = Immutable.isCollection) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!immutableClassTypeValidator(propValue)) {
      var propType = getPropType(propValue);
      return new Error(
        `Invalid ${location} \`${propFullName}\` of type \`${propType}\` ` +
        `supplied to \`${componentName}\`, expected an Immutable.js ${immutableClassName}.`
      );
    }
    var mutablePropValue = propValue.toObject();
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      var error = checkPropTypes(checker, mutablePropValue, 'prop', componentName);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createShapeChecker(shapeTypes) {
  return createShapeTypeChecker(shapeTypes);
}

function createMapContainsChecker(shapeTypes) {
  return createShapeTypeChecker(shapeTypes, 'Map', Immutable.Map.isMap);
}

module.exports = ImmutablePropTypes;
