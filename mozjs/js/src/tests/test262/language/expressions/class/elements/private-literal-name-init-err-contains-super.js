// |reftest| skip error:SyntaxError -- class-fields-private is not supported
// This file was procedurally generated from the following sources:
// - src/class-elements/init-err-contains-super.case
// - src/class-elements/initializer-error/cls-expr-fields-private-name.template
/*---
description: Syntax error if `super()` used in class field (ClassElementName PrivateName)
esid: sec-class-definitions-static-semantics-early-errors
features: [class, class-fields-public, class-fields-private]
flags: [generated]
negative:
  phase: parse
  type: SyntaxError
info: |
    Static Semantics: Early Errors

      FieldDefinition:
        PropertyNameInitializeropt

      - It is a Syntax Error if Initializer is present and Initializer Contains SuperCall is true.

---*/


$DONOTEVALUATE();

var C = class {
  #x = super();
}
