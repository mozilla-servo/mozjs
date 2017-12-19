// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.2.3.13-0-1
description: Object.isExtensible must exist as a function
---*/

  var f = Object.isExtensible ;

assert.sameValue(typeof(f), "function", 'typeof(f)');

reportCompare(0, 0);
