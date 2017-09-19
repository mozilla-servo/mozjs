'use strict';
// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 11.4.1-5-a-19-s
description: >
    Strict Mode - SyntaxError is thrown when deleting a built-in
    (Function)
flags: [onlyStrict]
---*/


assert.throws(SyntaxError, function() {
            eval("delete Function;");
});

reportCompare(0, 0);
