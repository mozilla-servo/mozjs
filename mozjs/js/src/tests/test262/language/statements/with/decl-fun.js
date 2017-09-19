// |reftest| error:SyntaxError
// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: Function declaration not allowed in statement position
esid: sec-with-statement
es6id: 13.11
flags: [noStrict]
negative:
  phase: early
  type: SyntaxError
---*/

with ({}) function f() {}
