// Copyright (C) Copyright 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-generatorfunction
es6id: 25.2.1.1
description: Definition of instance `prototype` property
info: |
    [...]
    3. Return CreateDynamicFunction(C, NewTarget, "generator", args).

    19.2.1.1.1 Runtime Semantics: CreateDynamicFunction

    [...]
    27. If kind is "generator", then
        a. Let prototype be ObjectCreate(%GeneratorPrototype%).
        b. Perform DefinePropertyOrThrow(F, "prototype",
           PropertyDescriptor{[[Value]]: prototype, [[Writable]]: true,
           [[Enumerable]]: false, [[Configurable]]: false}).
    [...]
includes: [propertyHelper.js]
---*/

var GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor;

var instance = GeneratorFunction();

assert.sameValue(typeof instance.prototype, 'object');
assert.sameValue(
  Object.getPrototypeOf(instance.prototype),
  Object.getPrototypeOf(instance).prototype
);

verifyNotEnumerable(instance, 'prototype');
verifyWritable(instance, 'prototype');
verifyNotConfigurable(instance, 'prototype');

reportCompare(0, 0);
