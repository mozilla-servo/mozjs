// Copyright 2009 the Sputnik authors.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
info: The production x %= y is the same as x = x % y
es5id: 11.13.2_A4.3_T2.9
description: >
    Type(x) is different from Type(y) and both types vary between
    Boolean (primitive or object) and Null
---*/

var x;

//CHECK#1
x = true;
x %= null;
if (isNaN(x) !== true) {
  $ERROR('#1: x = true; x %= null; x === Not-a-Number. Actual: ' + (x));
}

//CHECK#2
x = null;
x %= true;
if (x !== 0) {
  $ERROR('#2: x = null; x %= true; x === 0. Actual: ' + (x));
}

//CHECK#3
x = new Boolean(true);
x %= null;
if (isNaN(x) !== true) {
  $ERROR('#3: x = new Boolean(true); x %= null; x === Not-a-Number. Actual: ' + (x));
}

//CHECK#4
x = null;
x %= new Boolean(true);
if (x !== 0) {
  $ERROR('#4: x = null; x %= new Boolean(true); x === 0. Actual: ' + (x));
}

reportCompare(0, 0);
