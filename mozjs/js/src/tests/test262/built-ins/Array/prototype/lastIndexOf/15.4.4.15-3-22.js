// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.4.4.15-3-22
description: >
    Array.prototype.lastIndexOf throws TypeError exception when
    'length' is an object with toString and valueOf methods that don�t
    return primitive values
---*/

        var toStringAccessed = false;
        var valueOfAccessed = false;

        var obj = {
            1: true,
            length: {
                toString: function () {
                    toStringAccessed = true;
                    return {};
                },

                valueOf: function () {
                    valueOfAccessed = true;
                    return {};
                }
            }
        };

assert.throws(TypeError, function() {
            Array.prototype.lastIndexOf.call(obj, true);
});

assert(toStringAccessed, 'toStringAccessed');
assert(valueOfAccessed, 'valueOfAccessed');

reportCompare(0, 0);
