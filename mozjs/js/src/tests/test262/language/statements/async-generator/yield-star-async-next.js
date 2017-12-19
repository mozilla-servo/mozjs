/*---
 author: Tooru Fujisawa [:arai] <arai_a@mac.com>
 esid: pending
 description: execution order for yield* with async iterator and next()
 info: >
    YieldExpression: yield * AssignmentExpression

    ...
    2. Let value be ? GetValue(exprRef).
    3. Let generatorKind be ! GetGeneratorKind().
    4. Let iterator be ? GetIterator(value, generatorKind).
    5. Let received be NormalCompletion(undefined).
    6. Repeat
      a. If received.[[Type]] is normal, then
        i. Let innerResult be ? IteratorNext(iterator, received.[[Value]]).
        ii. Let innerResult be ? Invoke(iterator, "next",
            « received.[[Value]] »).
        iii. If generatorKind is async, then set innerResult to
             ? Await(innerResult).
        ...
        v. Let done be ? IteratorComplete(innerResult).
        vi. If done is true, then
           1. Return ? IteratorValue(innerResult).
        vii. Let received be GeneratorYield(innerResult).
      ...

    GetIterator ( obj [ , hint ] )

    ...
    3. If hint is async,
      a. Set method to ? GetMethod(obj, @@asyncIterator).
      b. If method is undefined,
        i. Let syncMethod be ? GetMethod(obj, @@iterator).
        ii. Let syncIterator be ? Call(syncMethod, obj).
        iii. Return ? CreateAsyncFromSyncIterator(syncIterator).
    ...

    GeneratorYield ( iterNextObj )

    ...
    10. If generatorKind is async,
      a. Let value be IteratorValue(iterNextObj).
      b. Let done be IteratorComplete(iterNextObj).
      c. Return ! AsyncGeneratorResolve(generator, value, done).
    ...

 flags: [async]
---*/

var log = [];
var iter = {
  get [Symbol.iterator]() {
    log.push({ name: "get [Symbol.iterator]" });
  },
  get [Symbol.asyncIterator]() {
    log.push({
      name: "get [Symbol.asyncIterator]",
      thisValue: this
    });
    return function() {
      log.push({
        name: "call [Symbol.asyncIterator]",
        thisValue: this,
        args: [...arguments]
      });
      var nextCount = 0;
      return {
        name: "asyncIterator",
        get next() {
          log.push({
            name: "get next",
            thisValue: this
          });
          return function() {
            log.push({
              name: "call next",
              thisValue: this,
              args: [...arguments]
            });

            nextCount++;
            if (nextCount == 1) {
              return {
                name: "next-promise-1",
                get then() {
                  log.push({
                    name: "get next then (1)",
                    thisValue: this
                  });
                  return function(resolve) {
                    log.push({
                      name: "call next then (1)",
                      thisValue: this,
                      args: [...arguments]
                    });

                    resolve({
                      name: "next-result-1",
                      get value() {
                        log.push({
                          name: "get next value (1)",
                          thisValue: this
                        });
                        return "next-value-1";
                      },
                      get done() {
                        log.push({
                          name: "get next done (1)",
                          thisValue: this
                        });
                        return false;
                      }
                    });
                  };
                }
              };
            }

            return {
              name: "next-promise-2",
              get then() {
                log.push({
                  name: "get next then (2)",
                  thisValue: this
                });
                return function(resolve) {
                  log.push({
                    name: "call next then (2)",
                    thisValue: this,
                    args: [...arguments]
                  });

                  resolve({
                    name: "next-result-2",
                    get value() {
                      log.push({
                        name: "get next value (2)",
                        thisValue: this
                      });
                      return "next-value-2";
                    },
                    get done() {
                      log.push({
                        name: "get next done (2)",
                        thisValue: this
                      });
                      return true;
                    }
                  });
                };
              }
            };
          };
        }
      };
    };
  }
};
var asyncIterator = (async function*() {
  log.push({ name: "before yield*" });
  var v = yield* iter;
  log.push({
    name: "after yield*",
    value: v
  });
  return "return-value";
})();

assert.sameValue(log.length, 0, "log.length");

asyncIterator.next("next-arg-1").then(v => {
  assert.sameValue(log[0].name, "before yield*");

  assert.sameValue(log[1].name, "get [Symbol.asyncIterator]");
  assert.sameValue(log[1].thisValue, iter, "get [Symbol.asyncIterator] thisValue");

  assert.sameValue(log[2].name, "call [Symbol.asyncIterator]");
  assert.sameValue(log[2].thisValue, iter, "[Symbol.asyncIterator] thisValue");
  assert.sameValue(log[2].args.length, 0, "[Symbol.asyncIterator] args.length");

  assert.sameValue(log[3].name, "get next");
  assert.sameValue(log[3].thisValue.name, "asyncIterator", "get next thisValue");

  assert.sameValue(log[4].name, "call next");
  assert.sameValue(log[4].thisValue.name, "asyncIterator", "next thisValue");
  assert.sameValue(log[4].args.length, 1, "next args.length");
  assert.sameValue(log[4].args[0], undefined, "next args[0]");

  assert.sameValue(log[5].name, "get next then (1)");
  assert.sameValue(log[5].thisValue.name, "next-promise-1", "get next then thisValue");

  assert.sameValue(log[6].name, "call next then (1)");
  assert.sameValue(log[6].thisValue.name, "next-promise-1", "next then thisValue");
  assert.sameValue(log[6].args.length, 2, "next then args.length");
  assert.sameValue(typeof log[6].args[0], "function", "next then args[0]");
  assert.sameValue(typeof log[6].args[1], "function", "next then args[1]");

  assert.sameValue(log[7].name, "get next done (1)");
  assert.sameValue(log[7].thisValue.name, "next-result-1", "get next done thisValue");

  assert.sameValue(log[8].name, "get next value (1)");
  assert.sameValue(log[8].thisValue.name, "next-result-1", "get next value thisValue");

  assert.sameValue(log[9].name, "get next done (1)");
  assert.sameValue(log[9].thisValue.name, "next-result-1", "get next done thisValue");

  assert.sameValue(v.value, "next-value-1");
  assert.sameValue(v.done, false);

  assert.sameValue(log.length, 10, "log.length");

  asyncIterator.next("next-arg-2").then(v => {
    assert.sameValue(log[10].name, "get next");
    assert.sameValue(log[10].thisValue.name, "asyncIterator", "get next thisValue");

    assert.sameValue(log[11].name, "call next");
    assert.sameValue(log[11].thisValue.name, "asyncIterator", "next thisValue");
    assert.sameValue(log[11].args.length, 1, "next args.length");
    assert.sameValue(log[11].args[0], "next-arg-2", "next args[0]");

    assert.sameValue(log[12].name, "get next then (2)");
    assert.sameValue(log[12].thisValue.name, "next-promise-2", "get next then thisValue");

    assert.sameValue(log[13].name, "call next then (2)");
    assert.sameValue(log[13].thisValue.name, "next-promise-2", "next then thisValue");
    assert.sameValue(log[13].args.length, 2, "next then args.length");
    assert.sameValue(typeof log[13].args[0], "function", "next then args[0]");
    assert.sameValue(typeof log[13].args[1], "function", "next then args[1]");

    assert.sameValue(log[14].name, "get next done (2)");
    assert.sameValue(log[14].thisValue.name, "next-result-2", "get next done thisValue");

    assert.sameValue(log[15].name, "get next value (2)");
    assert.sameValue(log[15].thisValue.name, "next-result-2", "get next value thisValue");

    assert.sameValue(log[16].name, "after yield*");
    assert.sameValue(log[16].value, "next-value-2");

    assert.sameValue(v.value, "return-value");
    assert.sameValue(v.done, true);

    assert.sameValue(log.length, 17, "log.length");
  }).then($DONE, $DONE);
}).catch($DONE);
