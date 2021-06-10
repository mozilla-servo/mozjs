/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 * vim: set ts=8 sts=2 et sw=2 tw=80:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef jsfriendapi_h
#define jsfriendapi_h

#include "mozilla/MemoryReporting.h"
#include "mozilla/PodOperations.h"

#include "jspubtd.h"

#include "js/CallArgs.h"
#include "js/CharacterEncoding.h"
#include "js/Class.h"
#include "js/ErrorReport.h"
#include "js/Exception.h"
#include "js/GCAPI.h"
#include "js/HeapAPI.h"
#include "js/Object.h"           // JS::GetClass
#include "js/shadow/Function.h"  // JS::shadow::Function
#include "js/shadow/Object.h"    // JS::shadow::Object
#include "js/TypeDecls.h"
#include "js/Utility.h"

class JSJitInfo;

namespace JS {
template <class T>
class Heap;

class ExceptionStack;
} /* namespace JS */

extern JS_FRIEND_API void JS_SetGrayGCRootsTracer(JSContext* cx,
                                                  JSTraceDataOp traceOp,
                                                  void* data);

extern JS_FRIEND_API JSObject* JS_FindCompilationScope(JSContext* cx,
                                                       JS::HandleObject obj);

extern JS_FRIEND_API JSFunction* JS_GetObjectFunction(JSObject* obj);

/**
 * Allocate an object in exactly the same way as JS_NewObjectWithGivenProto, but
 * without invoking the metadata callback on it.  This allows creation of
 * internal bookkeeping objects that are guaranteed to not have metadata
 * attached to them.
 */
extern JS_FRIEND_API JSObject* JS_NewObjectWithoutMetadata(
    JSContext* cx, const JSClass* clasp, JS::Handle<JSObject*> proto);

extern JS_FRIEND_API bool JS_NondeterministicGetWeakMapKeys(
    JSContext* cx, JS::HandleObject obj, JS::MutableHandleObject ret);

extern JS_FRIEND_API bool JS_NondeterministicGetWeakSetKeys(
    JSContext* cx, JS::HandleObject obj, JS::MutableHandleObject ret);

// Raw JSScript* because this needs to be callable from a signal handler.
extern JS_FRIEND_API unsigned JS_PCToLineNumber(JSScript* script,
                                                jsbytecode* pc,
                                                unsigned* columnp = nullptr);

/**
 * Determine whether the given object is backed by a DeadObjectProxy.
 *
 * Such objects hold no other objects (they have no outgoing reference edges)
 * and will throw if you touch them (e.g. by reading/writing a property).
 */
extern JS_FRIEND_API bool JS_IsDeadWrapper(JSObject* obj);

/**
 * Creates a new dead wrapper object in the given scope. To be used when
 * attempting to wrap objects from scopes which are already dead.
 *
 * If origObject is passed, it must be an proxy object, and will be
 * used to determine the characteristics of the new dead wrapper.
 */
extern JS_FRIEND_API JSObject* JS_NewDeadWrapper(
    JSContext* cx, JSObject* origObject = nullptr);

namespace js {

/**
 * Get the script private value associated with an object, if any.
 *
 * The private value is set with SetScriptPrivate() or SetModulePrivate() and is
 * internally stored on the relevant ScriptSourceObject.
 *
 * This is used by the cycle collector to trace through
 * ScriptSourceObjects. This allows private values to contain an nsISupports
 * pointer and hence support references to cycle collected C++ objects.
 */
JS_FRIEND_API JS::Value MaybeGetScriptPrivate(JSObject* object);

}  // namespace js

/*
 * Used by the cycle collector to trace through a shape or object group and
 * all cycle-participating data it reaches, using bounded stack space.
 */
extern JS_FRIEND_API void JS_TraceShapeCycleCollectorChildren(
    JS::CallbackTracer* trc, JS::GCCellPtr shape);
extern JS_FRIEND_API void JS_TraceObjectGroupCycleCollectorChildren(
    JS::CallbackTracer* trc, JS::GCCellPtr group);

extern JS_FRIEND_API JSPrincipals* JS_GetScriptPrincipals(JSScript* script);

extern JS_FRIEND_API bool JS_ScriptHasMutedErrors(JSScript* script);

extern JS_FRIEND_API JSObject* JS_CloneObject(JSContext* cx,
                                              JS::HandleObject obj,
                                              JS::HandleObject proto);

/**
 * Copy the own properties of src to dst in a fast way.  src and dst must both
 * be native and must be in the compartment of cx.  They must have the same
 * class, the same parent, and the same prototype.  Class reserved slots will
 * NOT be copied.
 *
 * dst must not have any properties on it before this function is called.
 *
 * src must have been allocated via JS_NewObjectWithoutMetadata so that we can
 * be sure it has no metadata that needs copying to dst.  This also means that
 * dst needs to have the compartment global as its parent.  This function will
 * preserve the existing metadata on dst, if any.
 */
extern JS_FRIEND_API bool JS_InitializePropertiesFromCompatibleNativeObject(
    JSContext* cx, JS::HandleObject dst, JS::HandleObject src);

namespace js {

JS_FRIEND_API bool IsArgumentsObject(JS::HandleObject obj);

JS_FRIEND_API bool AddRawValueRoot(JSContext* cx, JS::Value* vp,
                                   const char* name);

JS_FRIEND_API void RemoveRawValueRoot(JSContext* cx, JS::Value* vp);

}  // namespace js

namespace JS {

/**
 * Set all of the uninitialized lexicals on an object to undefined. Return
 * true if any lexicals were initialized and false otherwise.
 * */
extern JS_FRIEND_API bool ForceLexicalInitialization(JSContext* cx,
                                                     HandleObject obj);

/**
 * Whether we are poisoning unused/released data for error detection. Governed
 * by the JS_GC_ALLOW_EXTRA_POISONING #ifdef as well as the
 * $JSGC_EXTRA_POISONING environment variable.
 */
extern JS_FRIEND_API int IsGCPoisoning();

extern JS_FRIEND_API JSPrincipals* GetRealmPrincipals(JS::Realm* realm);

extern JS_FRIEND_API void SetRealmPrincipals(JS::Realm* realm,
                                             JSPrincipals* principals);

extern JS_FRIEND_API bool GetIsSecureContext(JS::Realm* realm);

}  // namespace JS

/**
 * Copies all own properties and private fields from |obj| to |target|. Both
 * |obj| and |target| must not be cross-compartment wrappers because we have to
 * enter their realms.
 *
 * This function immediately enters a realm, and does not impose any
 * restrictions on the realm of |cx|.
 */
extern JS_FRIEND_API bool JS_CopyOwnPropertiesAndPrivateFields(
    JSContext* cx, JS::HandleObject target, JS::HandleObject obj);

extern JS_FRIEND_API bool JS_WrapPropertyDescriptor(
    JSContext* cx, JS::MutableHandle<JS::PropertyDescriptor> desc);

struct JSFunctionSpecWithHelp {
  const char* name;
  JSNative call;
  uint16_t nargs;
  uint16_t flags;
  const JSJitInfo* jitInfo;
  const char* usage;
  const char* help;
};

#define JS_FN_HELP(name, call, nargs, flags, usage, help) \
  { name, call, nargs, (flags) | JSPROP_ENUMERATE, nullptr, usage, help }
#define JS_INLINABLE_FN_HELP(name, call, nargs, flags, native, usage, help)    \
  {                                                                            \
    name, call, nargs, (flags) | JSPROP_ENUMERATE, &js::jit::JitInfo_##native, \
        usage, help                                                            \
  }
#define JS_FS_HELP_END \
  { nullptr, nullptr, 0, 0, nullptr, nullptr }

extern JS_FRIEND_API bool JS_DefineFunctionsWithHelp(
    JSContext* cx, JS::HandleObject obj, const JSFunctionSpecWithHelp* fs);

namespace js {

/**
 * Use the runtime's internal handling of job queues for Promise jobs.
 *
 * Most embeddings, notably web browsers, will have their own task scheduling
 * systems and need to integrate handling of Promise jobs into that, so they
 * will want to manage job queues themselves. For basic embeddings such as the
 * JS shell that don't have an event loop of their own, it's easier to have
 * SpiderMonkey handle job queues internally.
 *
 * Note that the embedding still has to trigger processing of job queues at
 * right time(s), such as after evaluation of a script has run to completion.
 */
extern JS_FRIEND_API bool UseInternalJobQueues(JSContext* cx);

/**
 * Enqueue |job| on the internal job queue.
 *
 * This is useful in tests for creating situations where a call occurs with no
 * other JavaScript on the stack.
 */
extern JS_FRIEND_API bool EnqueueJob(JSContext* cx, JS::HandleObject job);

/**
 * Instruct the runtime to stop draining the internal job queue.
 *
 * Useful if the embedding is in the process of quitting in reaction to a
 * builtin being called, or if it wants to resume executing jobs later on.
 */
extern JS_FRIEND_API void StopDrainingJobQueue(JSContext* cx);

extern JS_FRIEND_API void RunJobs(JSContext* cx);

extern JS_FRIEND_API JS::Zone* GetRealmZone(JS::Realm* realm);

using PreserveWrapperCallback = bool (*)(JSContext*, JS::HandleObject);
using HasReleasedWrapperCallback = bool (*)(JS::HandleObject);

extern JS_FRIEND_API bool IsSystemRealm(JS::Realm* realm);

extern JS_FRIEND_API bool IsSystemCompartment(JS::Compartment* comp);

extern JS_FRIEND_API bool IsSystemZone(JS::Zone* zone);

struct WeakMapTracer {
  JSRuntime* runtime;

  explicit WeakMapTracer(JSRuntime* rt) : runtime(rt) {}

  // Weak map tracer callback, called once for every binding of every
  // weak map that was live at the time of the last garbage collection.
  //
  // m will be nullptr if the weak map is not contained in a JS Object.
  //
  // The callback should not GC (and will assert in a debug build if it does
  // so.)
  virtual void trace(JSObject* m, JS::GCCellPtr key, JS::GCCellPtr value) = 0;
};

extern JS_FRIEND_API void TraceWeakMaps(WeakMapTracer* trc);

extern JS_FRIEND_API bool AreGCGrayBitsValid(JSRuntime* rt);

extern JS_FRIEND_API bool ZoneGlobalsAreAllGray(JS::Zone* zone);

extern JS_FRIEND_API bool IsCompartmentZoneSweepingOrCompacting(
    JS::Compartment* comp);

using IterateGCThingCallback = void (*)(void*, JS::GCCellPtr,
                                        const JS::AutoRequireNoGC&);

extern JS_FRIEND_API void TraceGrayWrapperTargets(JSTracer* trc,
                                                  JS::Zone* zone);

/**
 * Invoke cellCallback on every gray JSObject in the given zone.
 */
extern JS_FRIEND_API void IterateGrayObjects(
    JS::Zone* zone, IterateGCThingCallback cellCallback, void* data);

#if defined(JS_GC_ZEAL) || defined(DEBUG)
// Trace the heap and check there are no black to gray edges. These are
// not allowed since the cycle collector could throw away the gray thing and
// leave a dangling pointer.
//
// This doesn't trace weak maps as these are handled separately.
extern JS_FRIEND_API bool CheckGrayMarkingState(JSRuntime* rt);
#endif

// Note: this returns nullptr iff |zone| is the atoms zone.
extern JS_FRIEND_API JS::Realm* GetAnyRealmInZone(JS::Zone* zone);

// Returns the first realm's global in a compartment. Note: this is not
// guaranteed to always be the same realm because individual realms can be
// collected by the GC.
extern JS_FRIEND_API JSObject* GetFirstGlobalInCompartment(
    JS::Compartment* comp);

// Returns true if the compartment contains a global object and this global is
// not being collected.
extern JS_FRIEND_API bool CompartmentHasLiveGlobal(JS::Compartment* comp);

// Returns true if this compartment can be shared across multiple Realms.  Used
// when we're looking for an existing compartment to place a new Realm in.
extern JS_FRIEND_API bool IsSharableCompartment(JS::Compartment* comp);

// This is equal to |&JSObject::class_|.  Use it in places where you don't want
// to #include vm/JSObject.h.
extern JS_FRIEND_DATA const JSClass* const ObjectClassPtr;

JS_FRIEND_API const JSClass* ProtoKeyToClass(JSProtoKey key);

// Returns the key for the class inherited by a given standard class (that
// is to say, the prototype of this standard class's prototype).
//
// You must be sure that this corresponds to a standard class with a cached
// JSProtoKey before calling this function. In general |key| will match the
// cached proto key, except in cases where multiple JSProtoKeys share a
// JSClass.
inline JSProtoKey InheritanceProtoKeyForStandardClass(JSProtoKey key) {
  // [Object] has nothing to inherit from.
  if (key == JSProto_Object) {
    return JSProto_Null;
  }

  // If we're ClassSpec defined return the proto key from that
  if (ProtoKeyToClass(key)->specDefined()) {
    return ProtoKeyToClass(key)->specInheritanceProtoKey();
  }

  // Otherwise, we inherit [Object].
  return JSProto_Object;
}

JS_FRIEND_API bool ShouldIgnorePropertyDefinition(JSContext* cx, JSProtoKey key,
                                                  jsid id);

JS_FRIEND_API bool IsFunctionObject(JSObject* obj);

JS_FRIEND_API bool UninlinedIsCrossCompartmentWrapper(const JSObject* obj);

// CrossCompartmentWrappers are shared by all realms within the compartment, so
// getting a wrapper's realm usually doesn't make sense.
static MOZ_ALWAYS_INLINE JS::Realm* GetNonCCWObjectRealm(JSObject* obj) {
  MOZ_ASSERT(!js::UninlinedIsCrossCompartmentWrapper(obj));
  return reinterpret_cast<JS::shadow::Object*>(obj)->shape->base->realm;
}

JS_FRIEND_API void AssertSameCompartment(JSContext* cx, JSObject* obj);

JS_FRIEND_API void AssertSameCompartment(JSContext* cx, JS::HandleValue v);

#ifdef JS_DEBUG
JS_FRIEND_API void AssertSameCompartment(JSObject* objA, JSObject* objB);
#else
inline void AssertSameCompartment(JSObject* objA, JSObject* objB) {}
#endif

JS_FRIEND_API void NotifyAnimationActivity(JSObject* obj);

JS_FRIEND_API JSFunction* DefineFunctionWithReserved(
    JSContext* cx, JSObject* obj, const char* name, JSNative call,
    unsigned nargs, unsigned attrs);

JS_FRIEND_API JSFunction* NewFunctionWithReserved(JSContext* cx, JSNative call,
                                                  unsigned nargs,
                                                  unsigned flags,
                                                  const char* name);

JS_FRIEND_API JSFunction* NewFunctionByIdWithReserved(JSContext* cx,
                                                      JSNative native,
                                                      unsigned nargs,
                                                      unsigned flags, jsid id);

JS_FRIEND_API const JS::Value& GetFunctionNativeReserved(JSObject* fun,
                                                         size_t which);

JS_FRIEND_API void SetFunctionNativeReserved(JSObject* fun, size_t which,
                                             const JS::Value& val);

JS_FRIEND_API bool FunctionHasNativeReserved(JSObject* fun);

JS_FRIEND_API bool GetObjectProto(JSContext* cx, JS::HandleObject obj,
                                  JS::MutableHandleObject proto);

extern JS_FRIEND_API JSObject* GetStaticPrototype(JSObject* obj);

JS_FRIEND_API bool GetRealmOriginalEval(JSContext* cx,
                                        JS::MutableHandleObject eval);

/**
 * Add some or all property keys of obj to the id vector *props.
 *
 * The flags parameter controls which property keys are added. Pass a
 * combination of the following bits:
 *
 *     JSITER_OWNONLY - Don't also search the prototype chain; only consider
 *       obj's own properties.
 *
 *     JSITER_HIDDEN - Include nonenumerable properties.
 *
 *     JSITER_SYMBOLS - Include property keys that are symbols. The default
 *       behavior is to filter out symbols.
 *
 *     JSITER_SYMBOLSONLY - Exclude non-symbol property keys.
 *
 * This is the closest C++ API we have to `Reflect.ownKeys(obj)`, or
 * equivalently, the ES6 [[OwnPropertyKeys]] internal method. Pass
 * `JSITER_OWNONLY | JSITER_HIDDEN | JSITER_SYMBOLS` as flags to get
 * results that match the output of Reflect.ownKeys.
 */
JS_FRIEND_API bool GetPropertyKeys(JSContext* cx, JS::HandleObject obj,
                                   unsigned flags,
                                   JS::MutableHandleIdVector props);

JS_FRIEND_API bool AppendUnique(JSContext* cx, JS::MutableHandleIdVector base,
                                JS::HandleIdVector others);

/**
 * Determine whether the given string is an array index in the sense of
 * <https://tc39.github.io/ecma262/#array-index>.
 *
 * If it isn't, returns false.
 *
 * If it is, returns true and outputs the index in *indexp.
 */
JS_FRIEND_API bool StringIsArrayIndex(JSLinearString* str, uint32_t* indexp);

/**
 * Overload of StringIsArrayIndex taking a (char16_t*,length) pair. Behaves
 * the same as the JSLinearString version.
 */
JS_FRIEND_API bool StringIsArrayIndex(const char16_t* str, uint32_t length,
                                      uint32_t* indexp);

JS_FRIEND_API void SetPreserveWrapperCallbacks(
    JSContext* cx, PreserveWrapperCallback preserveWrapper,
    HasReleasedWrapperCallback hasReleasedWrapper);

JS_FRIEND_API bool IsObjectInContextCompartment(JSObject* obj,
                                                const JSContext* cx);

/*
 * NB: keep these in sync with the copy in builtin/SelfHostingDefines.h.
 */
/* 0x1 is no longer used */
/* 0x2 is no longer used */
#define JSITER_PRIVATE 0x4      /* Include private names in iteration */
#define JSITER_OWNONLY 0x8      /* iterate over obj's own properties only */
#define JSITER_HIDDEN 0x10      /* also enumerate non-enumerable properties */
#define JSITER_SYMBOLS 0x20     /* also include symbol property keys */
#define JSITER_SYMBOLSONLY 0x40 /* exclude string property keys */
#define JSITER_FORAWAITOF 0x80  /* for-await-of */

JS_FRIEND_API void StartPCCountProfiling(JSContext* cx);

JS_FRIEND_API void StopPCCountProfiling(JSContext* cx);

JS_FRIEND_API void PurgePCCounts(JSContext* cx);

JS_FRIEND_API size_t GetPCCountScriptCount(JSContext* cx);

JS_FRIEND_API JSString* GetPCCountScriptSummary(JSContext* cx, size_t script);

JS_FRIEND_API JSString* GetPCCountScriptContents(JSContext* cx, size_t script);

using DOMInstanceClassHasProtoAtDepth = bool (*)(const JSClass*, uint32_t,
                                                 uint32_t);
struct JSDOMCallbacks {
  DOMInstanceClassHasProtoAtDepth instanceClassMatchesProto;
};
using DOMCallbacks = struct JSDOMCallbacks;

extern JS_FRIEND_API void SetDOMCallbacks(JSContext* cx,
                                          const DOMCallbacks* callbacks);

extern JS_FRIEND_API const DOMCallbacks* GetDOMCallbacks(JSContext* cx);

extern JS_FRIEND_API JSObject* GetTestingFunctions(JSContext* cx);

/* Implemented in jsexn.cpp. */

/**
 * Get an error type name from a JSExnType constant.
 * Returns nullptr for invalid arguments and JSEXN_INTERNALERR
 */
extern JS_FRIEND_API JSLinearString* GetErrorTypeName(JSContext* cx,
                                                      int16_t exnType);

/* Implemented in CrossCompartmentWrapper.cpp. */
typedef enum NukeReferencesToWindow {
  NukeWindowReferences,
  DontNukeWindowReferences
} NukeReferencesToWindow;

typedef enum NukeReferencesFromTarget {
  NukeAllReferences,
  NukeIncomingReferences,
} NukeReferencesFromTarget;

/*
 * These filters are designed to be ephemeral stack classes, and thus don't
 * do any rooting or holding of their members.
 */
struct CompartmentFilter {
  virtual bool match(JS::Compartment* c) const = 0;
};

struct AllCompartments : public CompartmentFilter {
  virtual bool match(JS::Compartment* c) const override { return true; }
};

struct SingleCompartment : public CompartmentFilter {
  JS::Compartment* ours;
  explicit SingleCompartment(JS::Compartment* c) : ours(c) {}
  virtual bool match(JS::Compartment* c) const override { return c == ours; }
};

extern JS_FRIEND_API bool NukeCrossCompartmentWrappers(
    JSContext* cx, const CompartmentFilter& sourceFilter, JS::Realm* target,
    NukeReferencesToWindow nukeReferencesToWindow,
    NukeReferencesFromTarget nukeReferencesFromTarget);

extern JS_FRIEND_API bool AllowNewWrapper(JS::Compartment* target,
                                          JSObject* obj);

extern JS_FRIEND_API bool NukedObjectRealm(JSObject* obj);

/* Implemented in jsdate.cpp. */

/** Detect whether the internal date value is NaN. */
extern JS_FRIEND_API bool DateIsValid(JSContext* cx, JS::HandleObject obj,
                                      bool* isValid);

extern JS_FRIEND_API bool DateGetMsecSinceEpoch(JSContext* cx,
                                                JS::HandleObject obj,
                                                double* msecSinceEpoch);

} /* namespace js */

namespace js {

/* Implemented in vm/StructuredClone.cpp. */
extern JS_FRIEND_API uint64_t GetSCOffset(JSStructuredCloneWriter* writer);

}  // namespace js

namespace js {

/* Statically asserted in FunctionFlags.cpp. */
static const unsigned JS_FUNCTION_INTERPRETED_BITS = 0x0060;

}  // namespace js

static MOZ_ALWAYS_INLINE const JSJitInfo* FUNCTION_VALUE_TO_JITINFO(
    const JS::Value& v) {
  JSObject* obj = &v.toObject();
  MOZ_ASSERT(JS::GetClass(obj) == js::FunctionClassPtr);

  auto* fun = reinterpret_cast<JS::shadow::Function*>(obj);
  MOZ_ASSERT(!(fun->flags & js::JS_FUNCTION_INTERPRETED_BITS),
             "Unexpected non-native function");

  return fun->jitinfo;
}

static MOZ_ALWAYS_INLINE void SET_JITINFO(JSFunction* func,
                                          const JSJitInfo* info) {
  auto* fun = reinterpret_cast<JS::shadow::Function*>(func);
  MOZ_ASSERT(!(fun->flags & js::JS_FUNCTION_INTERPRETED_BITS));
  fun->jitinfo = info;
}

// All strings stored in jsids are atomized, but are not necessarily property
// names.
static MOZ_ALWAYS_INLINE bool JSID_IS_ATOM(jsid id) { return id.isAtom(); }

static MOZ_ALWAYS_INLINE bool JSID_IS_ATOM(jsid id, JSAtom* atom) {
  return id.isAtom(atom);
}

static MOZ_ALWAYS_INLINE JSAtom* JSID_TO_ATOM(jsid id) { return id.toAtom(); }

static_assert(sizeof(jsid) == sizeof(void*));

namespace js {

static MOZ_ALWAYS_INLINE JS::Value IdToValue(jsid id) {
  if (JSID_IS_STRING(id)) {
    return JS::StringValue(JSID_TO_STRING(id));
  }
  if (JSID_IS_INT(id)) {
    return JS::Int32Value(JSID_TO_INT(id));
  }
  if (JSID_IS_SYMBOL(id)) {
    return JS::SymbolValue(JSID_TO_SYMBOL(id));
  }
  MOZ_ASSERT(JSID_IS_VOID(id));
  return JS::UndefinedValue();
}

/**
 * PrepareScriptEnvironmentAndInvoke asserts the embedder has registered a
 * ScriptEnvironmentPreparer and then it calls the preparer's 'invoke' method
 * with the given |closure|, with the assumption that the preparer will set up
 * any state necessary to run script in |global|, invoke |closure| with a valid
 * JSContext*, report any exceptions thrown from the closure, and return.
 *
 * PrepareScriptEnvironmentAndInvoke will report any exceptions that are thrown
 * by the closure.  Consumers who want to propagate back whether the closure
 * succeeded should do so via members of the closure itself.
 */

struct ScriptEnvironmentPreparer {
  struct Closure {
    virtual bool operator()(JSContext* cx) = 0;
  };

  virtual void invoke(JS::HandleObject global, Closure& closure) = 0;
};

extern JS_FRIEND_API void PrepareScriptEnvironmentAndInvoke(
    JSContext* cx, JS::HandleObject global,
    ScriptEnvironmentPreparer::Closure& closure);

JS_FRIEND_API void SetScriptEnvironmentPreparer(
    JSContext* cx, ScriptEnvironmentPreparer* preparer);

// Abstract base class for objects that build allocation metadata for JavaScript
// values.
struct AllocationMetadataBuilder {
  AllocationMetadataBuilder() = default;

  // Return a metadata object for the newly constructed object |obj|, or
  // nullptr if there's no metadata to attach.
  //
  // Implementations should treat all errors as fatal; there is no way to
  // report errors from this callback. In particular, the caller provides an
  // oomUnsafe for overriding implementations to use.
  virtual JSObject* build(JSContext* cx, JS::HandleObject obj,
                          AutoEnterOOMUnsafeRegion& oomUnsafe) const {
    return nullptr;
  }
};

/**
 * Specify a callback to invoke when creating each JS object in the current
 * compartment, which may return a metadata object to associate with the
 * object.
 */
JS_FRIEND_API void SetAllocationMetadataBuilder(
    JSContext* cx, const AllocationMetadataBuilder* callback);

/** Get the metadata associated with an object. */
JS_FRIEND_API JSObject* GetAllocationMetadata(JSObject* obj);

JS_FRIEND_API bool GetElementsWithAdder(JSContext* cx, JS::HandleObject obj,
                                        JS::HandleObject receiver,
                                        uint32_t begin, uint32_t end,
                                        js::ElementAdder* adder);

JS_FRIEND_API bool ForwardToNative(JSContext* cx, JSNative native,
                                   const JS::CallArgs& args);

/**
 * Helper function for HTMLDocument and HTMLFormElement.
 *
 * These are the only two interfaces that have [OverrideBuiltins], a named
 * getter, and no named setter. They're implemented as proxies with a custom
 * getOwnPropertyDescriptor() method. Unfortunately, overriding
 * getOwnPropertyDescriptor() automatically affects the behavior of set(),
 * which normally is just common sense but is *not* desired for these two
 * interfaces.
 *
 * The fix is for these two interfaces to override set() to ignore the
 * getOwnPropertyDescriptor() override.
 *
 * SetPropertyIgnoringNamedGetter is exposed to make it easier to override
 * set() in this way.  It carries out all the steps of BaseProxyHandler::set()
 * except the initial getOwnPropertyDescriptor() call.  The caller must supply
 * that descriptor as the 'ownDesc' parameter.
 *
 * Implemented in proxy/BaseProxyHandler.cpp.
 */
JS_FRIEND_API bool SetPropertyIgnoringNamedGetter(
    JSContext* cx, JS::HandleObject obj, JS::HandleId id, JS::HandleValue v,
    JS::HandleValue receiver,
    JS::Handle<mozilla::Maybe<JS::PropertyDescriptor>> ownDesc,
    JS::ObjectOpResult& result);

// This function is for one specific use case, please don't use this for
// anything else!
extern JS_FRIEND_API bool ExecuteInFrameScriptEnvironment(
    JSContext* cx, JS::HandleObject obj, JS::HandleScript script,
    JS::MutableHandleObject scope);

extern JS_FRIEND_API bool IsSavedFrame(JSObject* obj);

// Matches the condition in js/src/jit/ProcessExecutableMemory.cpp
#if defined(XP_WIN)
// Parameters use void* types to avoid #including windows.h. The return value of
// this function is returned from the exception handler.
typedef long (*JitExceptionHandler)(void* exceptionRecord,  // PEXECTION_RECORD
                                    void* context);         // PCONTEXT

/**
 * Windows uses "structured exception handling" to handle faults. When a fault
 * occurs, the stack is searched for a handler (similar to C++ exception
 * handling). If the search does not find a handler, the "unhandled exception
 * filter" is called. Breakpad uses the unhandled exception filter to do crash
 * reporting. Unfortunately, on Win64, JIT code on the stack completely throws
 * off this unwinding process and prevents the unhandled exception filter from
 * being called. The reason is that Win64 requires unwind information be
 * registered for all code regions and JIT code has none. While it is possible
 * to register full unwind information for JIT code, this is a lot of work (one
 * has to be able to recover the frame pointer at any PC) so instead we register
 * a handler for all JIT code that simply calls breakpad's unhandled exception
 * filter (which will perform crash reporting and then terminate the process).
 * This would be wrong if there was an outer __try block that expected to handle
 * the fault, but this is not generally allowed.
 *
 * Gecko must call SetJitExceptionFilter before any JIT code is compiled and
 * only once per process.
 */
extern JS_FRIEND_API void SetJitExceptionHandler(JitExceptionHandler handler);
#endif

extern JS_FRIEND_API bool ReportIsNotFunction(JSContext* cx, JS::HandleValue v);

class MOZ_STACK_CLASS JS_FRIEND_API AutoAssertNoContentJS {
 public:
  explicit AutoAssertNoContentJS(JSContext* cx);
  ~AutoAssertNoContentJS();

 private:
  JSContext* context_;
  bool prevAllowContentJS_;
};

/**
 * This function only reports GC heap memory,
 * and not malloc allocated memory associated with GC things.
 */
extern JS_FRIEND_API uint64_t GetGCHeapUsageForObjectZone(JSObject* obj);

/**
 * Return whether a global object's realm has had instrumentation enabled by a
 * Debugger.
 */
extern JS_FRIEND_API bool GlobalHasInstrumentation(JSObject* global);

class JS_FRIEND_API CompartmentTransplantCallback {
 public:
  virtual JSObject* getObjectToTransplant(JS::Compartment* compartment) = 0;
};

// Gather a set of remote window proxies by calling the callback on every
// compartment, then transform them into cross-compartment wrappers to newTarget
// via brain transplants. If there's a proxy in newTarget's compartment, it will
// get swapped with newTarget, and the value of newTarget will be updated. If
// the callback returns null for a compartment, no cross-compartment wrapper
// will be created for that compartment. Any non-null values it returns must be
// DOM remote proxies from the compartment that was passed in.
extern JS_FRIEND_API void RemapRemoteWindowProxies(
    JSContext* cx, CompartmentTransplantCallback* callback,
    JS::MutableHandleObject newTarget);

namespace gc {

// API to let the DOM tell us whether we're currently in pageload, so we can
// change the GC triggers to discourage collection of the atoms zone.
//
// This is a temporary measure; bug 1544117 will make this unnecessary.

enum class PerformanceHint { Normal, InPageLoad };

extern JS_FRIEND_API void SetPerformanceHint(JSContext* cx,
                                             PerformanceHint hint);

} /* namespace gc */

extern JS_FRIEND_API JS::Zone* GetObjectZoneFromAnyThread(const JSObject* obj);

} /* namespace js */

#endif /* jsfriendapi_h */
