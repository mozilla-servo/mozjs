// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 13.0-4
description: >
    13.0 - multiple names in one function declaration is not allowed,
    add a new property into a property which is a object
---*/

        var obj = {};
        obj.tt = { len: 10 };
assert.throws(SyntaxError, function() {
            eval("function obj.tt.ss() {};");
});

reportCompare(0, 0);
