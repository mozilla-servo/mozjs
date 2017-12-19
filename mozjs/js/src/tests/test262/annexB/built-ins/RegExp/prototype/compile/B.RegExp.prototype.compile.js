// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es6id: B.2.5.1
description: >
    Object.getOwnPropertyDescriptor returns data desc for functions on
    built-ins (RegExp.prototype.compile)
includes: [propertyHelper.js]
---*/

verifyWritable(RegExp.prototype, "compile");
verifyNotEnumerable(RegExp.prototype, "compile");
verifyConfigurable(RegExp.prototype, "compile");

reportCompare(0, 0);
