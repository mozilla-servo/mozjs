// Copyright (C) 2015 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
es6id: 23.2.3.7
description: >
    Set.prototype.has ( value )

    1. Let S be the this value.
    2. If Type(S) is not Object, throw a TypeError exception.

---*/

assert.throws(TypeError, function() {
  Set.prototype.has.call(Symbol(), 1);
});

assert.throws(TypeError, function() {
  var s = new Set();
  s.has.call(Symbol(), 1);
});

reportCompare(0, 0);
