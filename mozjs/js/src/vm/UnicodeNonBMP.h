/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=8 sts=4 et sw=4 tw=99:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Generated by make_unicode.py DO NOT MODIFY */

#ifndef vm_UnicodeNonBMP_h
#define vm_UnicodeNonBMP_h

#define FOR_EACH_NON_BMP_LOWERCASE(macro) \
    macro(0x10400, 0x10427, 0xd801, 0xdc00, 0xdc27, 40) \
    macro(0x104b0, 0x104d3, 0xd801, 0xdcb0, 0xdcd3, 40) \
    macro(0x10c80, 0x10cb2, 0xd803, 0xdc80, 0xdcb2, 64) \
    macro(0x118a0, 0x118bf, 0xd806, 0xdca0, 0xdcbf, 32) \
    macro(0x1e900, 0x1e921, 0xd83a, 0xdd00, 0xdd21, 34)

#define FOR_EACH_NON_BMP_UPPERCASE(macro) \
    macro(0x10428, 0x1044f, 0xd801, 0xdc28, 0xdc4f, -40) \
    macro(0x104d8, 0x104fb, 0xd801, 0xdcd8, 0xdcfb, -40) \
    macro(0x10cc0, 0x10cf2, 0xd803, 0xdcc0, 0xdcf2, -64) \
    macro(0x118c0, 0x118df, 0xd806, 0xdcc0, 0xdcdf, -32) \
    macro(0x1e922, 0x1e943, 0xd83a, 0xdd22, 0xdd43, -34)

#define FOR_EACH_NON_BMP_CASE_FOLDING(macro) \
    macro(0x10400, 0x10427, 0xd801, 0xdc00, 0xdc27, 40) \
    macro(0x104b0, 0x104d3, 0xd801, 0xdcb0, 0xdcd3, 40) \
    macro(0x10c80, 0x10cb2, 0xd803, 0xdc80, 0xdcb2, 64) \
    macro(0x118a0, 0x118bf, 0xd806, 0xdca0, 0xdcbf, 32) \
    macro(0x1e900, 0x1e921, 0xd83a, 0xdd00, 0xdd21, 34)

#define FOR_EACH_NON_BMP_REV_CASE_FOLDING(macro) \
    macro(0x10428, 0x1044f, 0xd801, 0xdc28, 0xdc4f, -40) \
    macro(0x104d8, 0x104fb, 0xd801, 0xdcd8, 0xdcfb, -40) \
    macro(0x10cc0, 0x10cf2, 0xd803, 0xdcc0, 0xdcf2, -64) \
    macro(0x118c0, 0x118df, 0xd806, 0xdcc0, 0xdcdf, -32) \
    macro(0x1e922, 0x1e943, 0xd83a, 0xdd22, 0xdd43, -34)

#endif /* vm_UnicodeNonBMP_h */
