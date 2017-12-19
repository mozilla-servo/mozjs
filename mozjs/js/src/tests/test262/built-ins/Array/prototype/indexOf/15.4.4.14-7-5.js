// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.4.4.14-7-5
description: Array.prototype.indexOf returns correct index when 'fromIndex' is 1
---*/

assert.sameValue([1, 2, 3].indexOf(2, 1), 1, '[1, 2, 3].indexOf(2, 1)');

reportCompare(0, 0);
