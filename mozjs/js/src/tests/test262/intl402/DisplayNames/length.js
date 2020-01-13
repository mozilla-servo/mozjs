// |reftest| skip -- Intl.DisplayNames is not supported
// Copyright (C) 2019 Leo Balter. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-Intl.DisplayNames
description: >
  Intl.DisplayNames.length is 0.
info: |
  ECMAScript Standard Built-in Objects:

  Every built-in function object, including constructors, has a length
  property whose value is an integer. Unless otherwise specified, this
  value is equal to the largest number of named arguments shown in the
  subclause headings for the function description. Optional parameters
  (which are indicated with brackets: [ ]) or rest parameters (which
  are shown using the form «...name») are not included in the default
  argument count.

  Unless otherwise specified, the length property of a built-in function
  object has the attributes { [[Writable]]: false, [[Enumerable]]: false,
  [[Configurable]]: true }.
includes: [propertyHelper.js]
features: [Intl.DisplayNames]
---*/

verifyProperty(Intl.DisplayNames, "length", {
  value: 0,
  enumerable: false,
  writable: false,
  configurable: true,
});

reportCompare(0, 0);
