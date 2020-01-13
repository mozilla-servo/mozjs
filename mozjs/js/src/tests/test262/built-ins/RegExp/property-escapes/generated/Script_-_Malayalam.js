// |reftest| skip -- regexp-unicode-property-escapes is not supported
// Copyright 2019 Mathias Bynens. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
author: Mathias Bynens
description: >
  Unicode property escapes for `Script=Malayalam`
info: |
  Generated by https://github.com/mathiasbynens/unicode-property-escapes-tests
  Unicode v12.1.0
esid: sec-static-semantics-unicodematchproperty-p
features: [regexp-unicode-property-escapes]
includes: [regExpUtils.js]
---*/

const matchSymbols = buildString({
  loneCodePoints: [],
  ranges: [
    [0x000D00, 0x000D03],
    [0x000D05, 0x000D0C],
    [0x000D0E, 0x000D10],
    [0x000D12, 0x000D44],
    [0x000D46, 0x000D48],
    [0x000D4A, 0x000D4F],
    [0x000D54, 0x000D63],
    [0x000D66, 0x000D7F]
  ]
});
testPropertyEscapes(
  /^\p{Script=Malayalam}+$/u,
  matchSymbols,
  "\\p{Script=Malayalam}"
);
testPropertyEscapes(
  /^\p{Script=Mlym}+$/u,
  matchSymbols,
  "\\p{Script=Mlym}"
);
testPropertyEscapes(
  /^\p{sc=Malayalam}+$/u,
  matchSymbols,
  "\\p{sc=Malayalam}"
);
testPropertyEscapes(
  /^\p{sc=Mlym}+$/u,
  matchSymbols,
  "\\p{sc=Mlym}"
);

const nonMatchSymbols = buildString({
  loneCodePoints: [
    0x000D04,
    0x000D0D,
    0x000D11,
    0x000D45,
    0x000D49
  ],
  ranges: [
    [0x00DC00, 0x00DFFF],
    [0x000000, 0x000CFF],
    [0x000D50, 0x000D53],
    [0x000D64, 0x000D65],
    [0x000D80, 0x00DBFF],
    [0x00E000, 0x10FFFF]
  ]
});
testPropertyEscapes(
  /^\P{Script=Malayalam}+$/u,
  nonMatchSymbols,
  "\\P{Script=Malayalam}"
);
testPropertyEscapes(
  /^\P{Script=Mlym}+$/u,
  nonMatchSymbols,
  "\\P{Script=Mlym}"
);
testPropertyEscapes(
  /^\P{sc=Malayalam}+$/u,
  nonMatchSymbols,
  "\\P{sc=Malayalam}"
);
testPropertyEscapes(
  /^\P{sc=Mlym}+$/u,
  nonMatchSymbols,
  "\\P{sc=Mlym}"
);

reportCompare(0, 0);
