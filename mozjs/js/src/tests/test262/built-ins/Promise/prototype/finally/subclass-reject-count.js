// |reftest| async
// Copyright (C) 2018 Jordan Harband. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
author: Jordan Harband
description: Promise subclass finally on rejected creates the proper number of subclassed promises
esid: sec-promise.prototype.finally
features: [Promise.prototype.finally]
flags: [async]
---*/

var count = 0;
class FooPromise extends Promise {
  constructor(resolve, reject) {
    count++;
    return super(resolve, reject);
  }
}

FooPromise.reject().finally(() => {}).then($ERROR).catch(() => {
  assert.sameValue(7, count);
  $DONE();
});
