/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=8 sts=4 et sw=4 tw=99:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef _JSGLUE_INCLUDED
#define _JSGLUE_INCLUDED

#include "jsapi.h"
#include "jsfriendapi.h"
#include "js/Conversions.h"
#include "js/Initialization.h"
#include "js/MemoryMetrics.h"

// Reexport some functions that are marked inline.

namespace glue {

bool JS_Init();

JS::CompartmentOptions JS_NewCompartmentOptions();
JS::OwningCompileOptions JS_NewOwningCompileOptions(JSContext* cx);

JS::StackCapture JS_StackCapture_AllFrames();
JS::StackCapture JS_StackCapture_MaxFrames(uint32_t max);
JS::StackCapture JS_StackCapture_FirstSubsumedFrame(JSContext* cx, bool ignoreSelfHostedFrames);

bool JS_ForOfIteratorInit(JS::ForOfIterator* iterator, JS::HandleValue iterable, JS::ForOfIterator::NonIterableBehavior nonIterableBehavior);
bool JS_ForOfIteratorNext(JS::ForOfIterator* iterator, JS::MutableHandleValue val, bool* done);

JS::shadow::Zone* JS_AsShadowZone(JS::Zone* zone);

JS::CallArgs JS_CallArgsFromVp(unsigned argc, JS::Value* vp);

void JS_ValueSetBoolean(JS::Value* value, bool x);
bool JS_ValueIsBoolean(const JS::Value* value);
bool JS_ValueToBoolean(const JS::Value* value);

void JS_ValueSetDouble(JS::Value* value, double x);
bool JS_ValueIsDouble(const JS::Value* value);
double JS_ValueToDouble(const JS::Value* value);

void JS_ValueSetInt32(JS::Value* value, int32_t x);
bool JS_ValueIsInt32(const JS::Value* value);
int32_t JS_ValueToInt32(const JS::Value* value);

bool JS_ValueIsNumber(const JS::Value* value);
double JS_ValueToNumber(const JS::Value* value);

void JS_ValueSetNull(JS::Value* value);
bool JS_ValueIsNull(const JS::Value* value);

bool JS_ValueIsUndefined(const JS::Value* value);

}

// There's a couple of classes from pre-57 releases of SM that bindgen can't deal with.
// https://github.com/rust-lang-nursery/rust-bindgen/issues/851
// https://bugzilla.mozilla.org/show_bug.cgi?id=1277338
// https://rust-lang-nursery.github.io/rust-bindgen/replacing-types.html

/**
 * <div rustbindgen replaces="JS::CallArgs"></div>
 */

class MOZ_STACK_CLASS CallArgsReplacement
{
  protected:
    JS::Value* argv_;
    unsigned argc_;
    bool constructing_:1;
    bool ignoresReturnValue_:1;
#ifdef JS_DEBUG
    JS::detail::IncludeUsedRval wantUsedRval_;
#endif
};

/**
 * <div rustbindgen replaces="JSJitMethodCallArgs"></div>
 */

class JSJitMethodCallArgsReplacement
{
  private:
    JS::Value* argv_;
    unsigned argc_;
    bool constructing_:1;
    bool ignoresReturnValue_:1;
#ifdef JS_DEBUG
    JS::detail::NoUsedRval wantUsedRval_;
#endif
};

#endif
