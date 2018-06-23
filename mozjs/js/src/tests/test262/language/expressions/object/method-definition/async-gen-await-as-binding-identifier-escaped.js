// |reftest| error:SyntaxError
// This file was procedurally generated from the following sources:
// - src/async-generators/await-as-binding-identifier-escaped.case
// - src/async-generators/syntax/async-obj-method.template
/*---
description: await is a reserved keyword within generator function bodies and may not be used as a binding identifier. (Async generator method)
esid: prod-AsyncGeneratorMethod
features: [async-iteration]
flags: [generated]
negative:
  phase: parse
  type: SyntaxError
info: |
    Async Generator Function Definitions

    AsyncGeneratorMethod :
      async [no LineTerminator here] * PropertyName ( UniqueFormalParameters ) { AsyncGeneratorBody }


    BindingIdentifier : Identifier

    It is a Syntax Error if this production has a [Await] parameter and
    StringValue of Identifier is "await".

---*/
throw "Test262: This statement should not be evaluated.";

var obj = {
  async *method() {
    var \u0061wait;
  }
};
