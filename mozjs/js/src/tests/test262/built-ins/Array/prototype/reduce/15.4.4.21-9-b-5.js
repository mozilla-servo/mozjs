// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.4.4.21-9-b-5
description: >
    Array.prototype.reduce - properties added into own object in step
    8 are visited on an Array
---*/

        var testResult = false;

        function callbackfn(accum, val, idx, obj) {
            if (idx === 1 && val === 1) {
                testResult = true;
            }
        }

        var arr = [0, , 2];

        Object.defineProperty(arr, "0", {
            get: function () {
                Object.defineProperty(arr, "1", {
                    get: function () {
                        return 1;
                    },
                    configurable: true
                });
                return 0;
            },
            configurable: true
        });

        arr.reduce(callbackfn);

assert(testResult, 'testResult !== true');

reportCompare(0, 0);
