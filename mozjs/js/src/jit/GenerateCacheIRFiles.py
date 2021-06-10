# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# This script generates jit/CacheIROpsGenerated.h from CacheIROps.yaml

import buildconfig
import yaml
import six
from collections import OrderedDict
from mozbuild.preprocessor import Preprocessor

HEADER_TEMPLATE = """\
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef %(includeguard)s
#define %(includeguard)s

/* This file is generated by jit/GenerateCacheIRFiles.py. Do not edit! */

%(contents)s

#endif // %(includeguard)s
"""


def generate_header(c_out, includeguard, contents):
    c_out.write(
        HEADER_TEMPLATE
        % {
            "includeguard": includeguard,
            "contents": contents,
        }
    )


def load_yaml(yaml_path):
    # First invoke preprocessor.py so that we can use #ifdef JS_SIMULATOR in
    # the YAML file.
    pp = Preprocessor()
    pp.context.update(buildconfig.defines["ALLDEFINES"])
    pp.out = six.StringIO()
    pp.do_filter("substitution")
    pp.do_include(yaml_path)
    contents = pp.out.getvalue()

    # Load into an OrderedDict to ensure order is preserved. Note: Python 3.7+
    # also preserves ordering for normal dictionaries.
    # Code based on https://stackoverflow.com/a/21912744.
    class OrderedLoader(yaml.Loader):
        pass

    def construct_mapping(loader, node):
        loader.flatten_mapping(node)
        return OrderedDict(loader.construct_pairs(node))

    tag = yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG
    OrderedLoader.add_constructor(tag, construct_mapping)
    return yaml.load(contents, OrderedLoader)


# Information for generating CacheIRWriter code for a single argument. Tuple
# stores the C++ argument type and the CacheIRWriter method to call.
arg_writer_info = {
    "ValId": ("ValOperandId", "writeOperandId"),
    "ObjId": ("ObjOperandId", "writeOperandId"),
    "StringId": ("StringOperandId", "writeOperandId"),
    "SymbolId": ("SymbolOperandId", "writeOperandId"),
    "BooleanId": ("BooleanOperandId", "writeOperandId"),
    "Int32Id": ("Int32OperandId", "writeOperandId"),
    "NumberId": ("NumberOperandId", "writeOperandId"),
    "BigIntId": ("BigIntOperandId", "writeOperandId"),
    "ValueTagId": ("ValueTagOperandId", "writeOperandId"),
    "IntPtrId": ("IntPtrOperandId", "writeOperandId"),
    "RawId": ("OperandId", "writeOperandId"),
    "ShapeField": ("Shape*", "writeShapeField"),
    "GetterSetterField": ("GetterSetter*", "writeGetterSetterField"),
    "ObjectField": ("JSObject*", "writeObjectField"),
    "StringField": ("JSString*", "writeStringField"),
    "AtomField": ("JSAtom*", "writeStringField"),
    "PropertyNameField": ("PropertyName*", "writeStringField"),
    "SymbolField": ("JS::Symbol*", "writeSymbolField"),
    "BaseScriptField": ("BaseScript*", "writeBaseScriptField"),
    "RawInt32Field": ("uint32_t", "writeRawInt32Field"),
    "RawPointerField": ("const void*", "writeRawPointerField"),
    "IdField": ("jsid", "writeIdField"),
    "ValueField": ("const Value&", "writeValueField"),
    "RawInt64Field": ("uint64_t", "writeRawInt64Field"),
    "JSOpImm": ("JSOp", "writeJSOpImm"),
    "BoolImm": ("bool", "writeBoolImm"),
    "ByteImm": ("uint32_t", "writeByteImm"),  # uint32_t to enable fits-in-byte asserts.
    "GuardClassKindImm": ("GuardClassKind", "writeGuardClassKindImm"),
    "ValueTypeImm": ("ValueType", "writeValueTypeImm"),
    "JSWhyMagicImm": ("JSWhyMagic", "writeJSWhyMagicImm"),
    "CallFlagsImm": ("CallFlags", "writeCallFlagsImm"),
    "ScalarTypeImm": ("Scalar::Type", "writeScalarTypeImm"),
    "UnaryMathFunctionImm": ("UnaryMathFunction", "writeUnaryMathFunctionImm"),
    "WasmValTypeImm": ("wasm::ValType::Kind", "writeWasmValTypeImm"),
    "Int32Imm": ("int32_t", "writeInt32Imm"),
    "UInt32Imm": ("uint32_t", "writeUInt32Imm"),
    "JSNativeImm": ("JSNative", "writeJSNativeImm"),
    "StaticStringImm": ("const char*", "writeStaticStringImm"),
    "AllocKindImm": ("gc::AllocKind", "writeAllocKindImm"),
}


def gen_writer_method(name, args, custom_writer):
    """Generates a CacheIRWRiter method for a single opcode."""

    # Generate a single method that writes the opcode and each argument.
    # For example:
    #
    #   void guardShape(ObjOperandId obj, Shape* shape) {
    #     writeOp(CacheOp::GuardShape);
    #     writeOperandId(obj);
    #     writeShapeField(shape);
    #     assertLengthMatches();
    #  }
    #
    # The assertLengthMatches() call is to assert the information in the
    # arg_length dictionary below matches what's written.

    # Method names start with a lowercase letter.
    method_name = name[0].lower() + name[1:]
    if custom_writer:
        method_name += "_"

    method_args = []
    ret_type = "void"
    args_code = ""
    if args:
        for arg_name, arg_type in six.iteritems(args):
            cpp_type, write_method = arg_writer_info[arg_type]
            if arg_name == "result":
                ret_type = cpp_type
                args_code += "  {} result(newOperandId());\\\n".format(cpp_type)
                args_code += "  writeOperandId(result);\\\n"
            else:
                method_args.append("{} {}".format(cpp_type, arg_name))
                args_code += "  {}({});\\\n".format(write_method, arg_name)

    code = ""
    if custom_writer:
        code += "private:\\\n"
    code += "{} {}({}) {{\\\n".format(ret_type, method_name, ", ".join(method_args))
    code += "  writeOp(CacheOp::{});\\\n".format(name)
    code += args_code
    code += "  assertLengthMatches();\\\n"
    if ret_type != "void":
        code += "  return result;\\\n"
    code += "}"
    if custom_writer:
        code += "\\\npublic:"
    return code


# Information for generating code using CacheIRReader for a single argument.
# Tuple stores the C++ type, the suffix used for arguments/variables of this
# type, and the expression to read this type from CacheIRReader.
arg_reader_info = {
    "ValId": ("ValOperandId", "Id", "reader.valOperandId()"),
    "ObjId": ("ObjOperandId", "Id", "reader.objOperandId()"),
    "StringId": ("StringOperandId", "Id", "reader.stringOperandId()"),
    "SymbolId": ("SymbolOperandId", "Id", "reader.symbolOperandId()"),
    "BooleanId": ("BooleanOperandId", "Id", "reader.booleanOperandId()"),
    "Int32Id": ("Int32OperandId", "Id", "reader.int32OperandId()"),
    "NumberId": ("NumberOperandId", "Id", "reader.numberOperandId()"),
    "BigIntId": ("BigIntOperandId", "Id", "reader.bigIntOperandId()"),
    "ValueTagId": ("ValueTagOperandId", "Id", "reader.valueTagOperandId()"),
    "IntPtrId": ("IntPtrOperandId", "Id", "reader.intPtrOperandId()"),
    "RawId": ("uint32_t", "Id", "reader.rawOperandId()"),
    "ShapeField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "GetterSetterField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "ObjectField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "StringField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "AtomField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "PropertyNameField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "SymbolField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "BaseScriptField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "RawInt32Field": ("uint32_t", "Offset", "reader.stubOffset()"),
    "RawPointerField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "IdField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "ValueField": ("uint32_t", "Offset", "reader.stubOffset()"),
    "RawInt64Field": ("uint32_t", "Offset", "reader.stubOffset()"),
    "JSOpImm": ("JSOp", "", "reader.jsop()"),
    "BoolImm": ("bool", "", "reader.readBool()"),
    "ByteImm": ("uint8_t", "", "reader.readByte()"),
    "GuardClassKindImm": ("GuardClassKind", "", "reader.guardClassKind()"),
    "ValueTypeImm": ("ValueType", "", "reader.valueType()"),
    "JSWhyMagicImm": ("JSWhyMagic", "", "reader.whyMagic()"),
    "CallFlagsImm": ("CallFlags", "", "reader.callFlags()"),
    "ScalarTypeImm": ("Scalar::Type", "", "reader.scalarType()"),
    "UnaryMathFunctionImm": ("UnaryMathFunction", "", "reader.unaryMathFunction()"),
    "WasmValTypeImm": ("wasm::ValType::Kind", "", "reader.wasmValType()"),
    "Int32Imm": ("int32_t", "", "reader.int32Immediate()"),
    "UInt32Imm": ("uint32_t", "", "reader.uint32Immediate()"),
    "JSNativeImm": ("JSNative", "", "reinterpret_cast<JSNative>(reader.pointer())"),
    "StaticStringImm": ("const char*", "", "reinterpret_cast<char*>(reader.pointer())"),
    "AllocKindImm": ("gc::AllocKind", "", "reader.allocKind()"),
}


def gen_compiler_method(name, args):
    """Generates CacheIRCompiler or WarpCacheIRTranspiler header code for a
    single opcode."""

    method_name = "emit" + name

    # We generate the signature of the method that needs to be implemented and a
    # separate function forwarding to it. For example:
    #
    #   [[nodiscard]] bool emitGuardShape(ObjOperandId objId, uint32_t shapeOffset);
    #   [[nodiscard]] bool emitGuardShape(CacheIRReader& reader) {
    #     ObjOperandId objId = reader.objOperandId();
    #     uint32_t shapeOffset = reader.stubOffset();
    #     return emitGuardShape(objId, shapeOffset);
    #   }
    cpp_args = []
    method_args = []
    args_code = ""
    if args:
        for arg_name, arg_type in six.iteritems(args):
            cpp_type, suffix, readexpr = arg_reader_info[arg_type]
            cpp_name = arg_name + suffix
            cpp_args.append(cpp_name)
            method_args.append("{} {}".format(cpp_type, cpp_name))
            args_code += "  {} {} = {};\\\n".format(cpp_type, cpp_name, readexpr)

    # Generate signature.
    code = "[[nodiscard]] bool {}({});\\\n".format(method_name, ", ".join(method_args))

    # Generate the method forwarding to it.
    code += "[[nodiscard]] bool {}(CacheIRReader& reader) {{\\\n".format(method_name)
    code += args_code
    code += "  return {}({});\\\n".format(method_name, ", ".join(cpp_args))
    code += "}\\\n"

    return code


# For each argument type, the method name for printing it.
arg_spewer_method = {
    "ValId": "spewOperandId",
    "ObjId": "spewOperandId",
    "StringId": "spewOperandId",
    "SymbolId": "spewOperandId",
    "BooleanId": "spewOperandId",
    "Int32Id": "spewOperandId",
    "NumberId": "spewOperandId",
    "BigIntId": "spewOperandId",
    "ValueTagId": "spewOperandId",
    "IntPtrId": "spewOperandId",
    "RawId": "spewRawOperandId",
    "ShapeField": "spewField",
    "GetterSetterField": "spewField",
    "ObjectField": "spewField",
    "StringField": "spewField",
    "AtomField": "spewField",
    "PropertyNameField": "spewField",
    "SymbolField": "spewField",
    "BaseScriptField": "spewField",
    "RawInt32Field": "spewField",
    "RawPointerField": "spewField",
    "IdField": "spewField",
    "ValueField": "spewField",
    "RawInt64Field": "spewField",
    "JSOpImm": "spewJSOpImm",
    "BoolImm": "spewBoolImm",
    "ByteImm": "spewByteImm",
    "GuardClassKindImm": "spewGuardClassKindImm",
    "ValueTypeImm": "spewValueTypeImm",
    "JSWhyMagicImm": "spewJSWhyMagicImm",
    "CallFlagsImm": "spewCallFlagsImm",
    "ScalarTypeImm": "spewScalarTypeImm",
    "UnaryMathFunctionImm": "spewUnaryMathFunctionImm",
    "WasmValTypeImm": "spewWasmValTypeImm",
    "Int32Imm": "spewInt32Imm",
    "UInt32Imm": "spewUInt32Imm",
    "JSNativeImm": "spewJSNativeImm",
    "StaticStringImm": "spewStaticStringImm",
    "AllocKindImm": "spewAllocKindImm",
}


def gen_spewer_method(name, args):
    """Generates spewer code for a single opcode."""

    method_name = "spew" + name

    # Generate code like this:
    #
    #  void spewGuardShape(CacheIRReader& reader) {
    #     spewOp(CacheOp::GuardShape);
    #     spewOperandId("objId", reader.objOperandId());
    #     spewOperandSeparator();
    #     spewField("shapeOffset", reader.stubOffset());
    #     spewOpEnd();
    #  }
    args_code = ""
    if args:
        is_first = True
        for arg_name, arg_type in six.iteritems(args):
            _, suffix, readexpr = arg_reader_info[arg_type]
            arg_name += suffix
            spew_method = arg_spewer_method[arg_type]
            if not is_first:
                args_code += "  spewArgSeparator();\\\n"
            args_code += '  {}("{}", {});\\\n'.format(spew_method, arg_name, readexpr)
            is_first = False

    code = "void {}(CacheIRReader& reader) {{\\\n".format(method_name)
    code += "  spewOp(CacheOp::{});\\\n".format(name)
    code += args_code
    code += "  spewOpEnd();\\\n"
    code += "}\\\n"

    return code


def gen_clone_method(name, args):
    """Generates code for cloning a single opcode."""

    method_name = "clone" + name

    # Generate code like this:
    #
    #  void cloneGuardShape(CacheIRReader& reader, CacheIRWriter& writer) {
    #    writer.writeOp(CacheOp::GuardShape);
    #    ObjOperandId objId = reader.objOperandId();
    #    writer.writeOperandId(objId);
    #    uint32_t shapeOffset = reader.stubOffset();
    #    Shape* shape = getShapeField(shapeOffset);
    #    writer.writeShapeField(shape);
    #    writer.assertLengthMatches();
    #  }

    args_code = ""
    if args:
        for arg_name, arg_type in six.iteritems(args):
            if arg_type == "RawId":
                arg_type = "ValId"

            read_type, suffix, readexpr = arg_reader_info[arg_type]
            read_name = arg_name + suffix
            value_name = read_name
            args_code += "  {} {} = {};\\\n".format(read_type, read_name, readexpr)

            write_type, write_method = arg_writer_info[arg_type]
            if arg_name == "result":
                args_code += "  writer.newOperandId();\\\n"
            if suffix == "Offset":
                # If the write function takes T&, the intermediate variable
                # should be of type T.
                if write_type.endswith("&"):
                    write_type = write_type[:-1]
                value_name = arg_name
                args_code += "  {} {} = get{}({});\\\n".format(
                    write_type, value_name, arg_type, read_name
                )
            args_code += "  writer.{}({});\\\n".format(write_method, value_name)

    code = "void {}".format(method_name)
    code += "(CacheIRReader& reader, CacheIRWriter& writer) {{\\\n"
    code += "  writer.writeOp(CacheOp::{});\\\n".format(name)
    code += args_code
    code += "  writer.assertLengthMatches();\\\n"
    code += "}}\\\n"

    return code


# Length in bytes for each argument type, either an integer or a C++ expression.
# This is used to generate the CacheIROpArgLengths array. CacheIRWriter asserts
# the number of bytes written matches the value in that array.
arg_length = {
    "ValId": 1,
    "ObjId": 1,
    "StringId": 1,
    "SymbolId": 1,
    "BooleanId": 1,
    "Int32Id": 1,
    "NumberId": 1,
    "BigIntId": 1,
    "ValueTagId": 1,
    "IntPtrId": 1,
    "RawId": 1,
    "ShapeField": 1,
    "GetterSetterField": 1,
    "ObjectField": 1,
    "StringField": 1,
    "AtomField": 1,
    "PropertyNameField": 1,
    "SymbolField": 1,
    "BaseScriptField": 1,
    "RawInt32Field": 1,
    "RawPointerField": 1,
    "RawInt64Field": 1,
    "IdField": 1,
    "ValueField": 1,
    "ByteImm": 1,
    "BoolImm": 1,
    "CallFlagsImm": 1,
    "ScalarTypeImm": 1,
    "UnaryMathFunctionImm": 1,
    "JSOpImm": 1,
    "ValueTypeImm": 1,
    "GuardClassKindImm": 1,
    "JSWhyMagicImm": 1,
    "WasmValTypeImm": 1,
    "Int32Imm": 4,
    "UInt32Imm": 4,
    "JSNativeImm": "sizeof(uintptr_t)",
    "StaticStringImm": "sizeof(uintptr_t)",
    "AllocKindImm": 1,
}


def generate_cacheirops_header(c_out, yaml_path):
    """Generate CacheIROpsGenerated.h from CacheIROps.yaml. The generated file
    contains a list of all CacheIR ops and generated source code for
    CacheIRWriter and CacheIRCompiler."""

    data = load_yaml(yaml_path)

    # CACHE_IR_OPS items. Each item stores an opcode name and arguments length
    # expression. For example: _(GuardShape, 1 + 1)
    ops_items = []

    # Generated CacheIRWriter methods.
    writer_methods = []

    # Generated CacheIRCompiler methods.
    compiler_shared_methods = []
    compiler_unshared_methods = []

    # Generated WarpCacheIRTranspiler methods.
    transpiler_methods = []

    # List of ops supported by WarpCacheIRTranspiler.
    transpiler_ops = []

    # Generated methods for spewers.
    spewer_methods = []

    # Generated methods for cloning IC stubs
    clone_methods = []

    for op in data:
        name = op["name"]

        args = op["args"]
        assert args is None or isinstance(args, OrderedDict)

        shared = op["shared"]
        assert isinstance(shared, bool)

        transpile = op["transpile"]
        assert isinstance(transpile, bool)

        # Unscored Ops default to UINT32_MAX
        cost_estimate = op.get("cost_estimate", int(0xFFFFFFFF))
        assert isinstance(cost_estimate, int)

        custom_writer = op.get("custom_writer", False)
        assert isinstance(custom_writer, bool)

        if args:
            args_length = " + ".join([str(arg_length[v]) for v in args.values()])
        else:
            args_length = "0"

        transpile_str = "true" if transpile else "false"
        ops_items.append(
            "_({}, {}, {}, {})".format(name, args_length, transpile_str, cost_estimate)
        )

        writer_methods.append(gen_writer_method(name, args, custom_writer))

        if shared:
            compiler_shared_methods.append(gen_compiler_method(name, args))
        else:
            compiler_unshared_methods.append(gen_compiler_method(name, args))

        if transpile:
            transpiler_methods.append(gen_compiler_method(name, args))
            transpiler_ops.append("_({})".format(name))

        spewer_methods.append(gen_spewer_method(name, args))

        clone_methods.append(gen_clone_method(name, args))

    contents = "#define CACHE_IR_OPS(_)\\\n"
    contents += "\\\n".join(ops_items)
    contents += "\n\n"

    contents += "#define CACHE_IR_WRITER_GENERATED \\\n"
    contents += "\\\n".join(writer_methods)
    contents += "\n\n"

    contents += "#define CACHE_IR_COMPILER_SHARED_GENERATED \\\n"
    contents += "\\\n".join(compiler_shared_methods)
    contents += "\n\n"

    contents += "#define CACHE_IR_COMPILER_UNSHARED_GENERATED \\\n"
    contents += "\\\n".join(compiler_unshared_methods)
    contents += "\n\n"

    contents += "#define CACHE_IR_TRANSPILER_GENERATED \\\n"
    contents += "\\\n".join(transpiler_methods)
    contents += "\n\n"

    contents += "#define CACHE_IR_TRANSPILER_OPS(_)\\\n"
    contents += "\\\n".join(transpiler_ops)
    contents += "\n\n"

    contents += "#define CACHE_IR_SPEWER_GENERATED \\\n"
    contents += "\\\n".join(spewer_methods)
    contents += "\n\n"

    contents += "#define CACHE_IR_CLONE_GENERATED \\\n"
    contents += "\\\n".join(clone_methods)
    contents += "\n\n"

    generate_header(c_out, "jit_CacheIROpsGenerated_h", contents)
