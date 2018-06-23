// |reftest| skip -- regexp-unicode-property-escapes is not supported
// Copyright 2017 Mathias Bynens. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
author: Mathias Bynens
description: >
  Unicode property escapes for `Script=Takri`
info: |
  Generated by https://github.com/mathiasbynens/unicode-property-escapes-tests
  Unicode v10.0.0
  Emoji v5.0 (UTR51)
esid: sec-static-semantics-unicodematchproperty-p
features: [regexp-unicode-property-escapes]
includes: [regExpUtils.js]
---*/

const matchSymbols = buildString({
  loneCodePoints: [],
  ranges: [
    [0x011680, 0x0116B7],
    [0x0116C0, 0x0116C9]
  ]
});
testPropertyEscapes(
  /^\p{Script=Takri}+$/u,
  matchSymbols,
  "\\p{Script=Takri}"
);
testPropertyEscapes(
  /^\p{Script=Takr}+$/u,
  matchSymbols,
  "\\p{Script=Takr}"
);
testPropertyEscapes(
  /^\p{sc=Takri}+$/u,
  matchSymbols,
  "\\p{sc=Takri}"
);
testPropertyEscapes(
  /^\p{sc=Takr}+$/u,
  matchSymbols,
  "\\p{sc=Takr}"
);

const nonMatchSymbols = buildString({
  loneCodePoints: [],
  ranges: [
    [0x00DC00, 0x00DFFF],
    [0x000000, 0x00DBFF],
    [0x00E000, 0x01167F],
    [0x0116B8, 0x0116BF],
    [0x0116CA, 0x10FFFF]
  ]
});
testPropertyEscapes(
  /^\P{Script=Takri}+$/u,
  nonMatchSymbols,
  "\\P{Script=Takri}"
);
testPropertyEscapes(
  /^\P{Script=Takr}+$/u,
  nonMatchSymbols,
  "\\P{Script=Takr}"
);
testPropertyEscapes(
  /^\P{sc=Takri}+$/u,
  nonMatchSymbols,
  "\\P{sc=Takri}"
);
testPropertyEscapes(
  /^\P{sc=Takr}+$/u,
  nonMatchSymbols,
  "\\P{sc=Takr}"
);

reportCompare(0, 0);
