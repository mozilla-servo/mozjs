/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.gecko.annotationProcessors;

/**
 * Generate C++ bindings for SDK classes using a config file.
 *
 * java SDKProcessor <sdkjar> <configfile> <outdir> <fileprefix> <max-sdk-version>
 *
 * <sdkjar>: jar file containing the SDK classes (e.g. android.jar)
 * <configfile>: config file for generating bindings
 * <outdir>: output directory for generated binding files
 * <fileprefix>: prefix used for generated binding files
 * <max-sdk-version>: SDK version for generated class members (bindings will not be
 *                     generated for members with SDK versions higher than max-sdk-version)
 *
 * The config file is a text file following the .ini format:
 *
 * ; comment
 * [section1]
 * property = value
 *
 * # comment
 * [section2]
 * property = value
 *
 * Each section specifies a qualified SDK class. Each property specifies a
 * member of that class. The class and/or the property may specify options
 * found in the WrapForJNI annotation. For example,
 *
 * # Generate bindings for Bundle using default options:
 * [android.os.Bundle]
 *
 * # Generate bindings for Bundle using class options:
 * [android.os.Bundle = exceptionMode:nsresult]
 *
 * # Generate bindings for Bundle using method options:
 * [android.os.Bundle]
 * putInt = stubName:PutInteger
 *
 * # Generate bindings for Bundle using class options with method override:
 * # (note that all options are overriden at the same time.)
 * [android.os.Bundle = exceptionMode:nsresult]
 * # putInt will have stubName "PutInteger", and exceptionMode of "abort"
 * putInt = stubName:PutInteger
 * # putChar will have stubName "PutCharacter", and exceptionMode of "nsresult"
 * putChar = stubName:PutCharacter, exceptionMode:nsresult
 *
 * # Overloded methods can be specified using its signature
 * [android.os.Bundle]
 * # Skip the copy constructor
 * <init>(Landroid/os/Bundle;)V = skip:true
 *
 * # Generic member types can be specified
 * [android.view.KeyEvent = skip:true]
 * # Skip everything except fields
 * <field> = skip:false
 *
 * # Skip everything except putInt and putChar
 * [android.os.Bundle = skip:true]
 * putInt = skip:false
 * putChar =
 *
 * # Avoid conflicts in native bindings
 * [android.os.Bundle]
 * # Bundle(PersistableBundle) native binding can conflict with Bundle(ClassLoader)
 * <init>(Landroid/os/PersistableBundle;)V = stubName:NewFromPersistableBundle
 *
 * # Generate a getter instead of a literal for certain runtime constants
 * [android.os.Build$VERSION = skip:true]
 * SDK_INT = noLiteral:true
 */

import com.android.tools.lint.checks.ApiLookup;
import com.android.tools.lint.LintCliClient;

import org.mozilla.gecko.annotationProcessors.classloader.AnnotatableEntity;
import org.mozilla.gecko.annotationProcessors.classloader.ClassWithOptions;
import org.mozilla.gecko.annotationProcessors.classloader.IterableJarLoadingURLClassLoader;
import org.mozilla.gecko.annotationProcessors.utils.GeneratableElementIterator;
import org.mozilla.gecko.annotationProcessors.utils.Utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.net.URL;
import java.net.URLClassLoader;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class SDKProcessor {
    public static final String GENERATED_COMMENT =
            "// GENERATED CODE\n" +
            "// Generated by the Java program at /build/annotationProcessors at compile time\n" +
            "// from annotations on Java methods. To update, change the annotations on the\n" +
            "// corresponding Javamethods and rerun the build. Manually updating this file\n" +
            "// will cause your build to fail.\n" +
            "\n";

    private static ApiLookup sApiLookup;
    private static int sMaxSdkVersion;

    private static class ParseException extends Exception {
        public ParseException(final String message) {
            super(message);
        }
    }

    private static class ClassInfo {
        public final String name;

        // Map constructor/field/method signature to a set of annotation values.
        private final HashMap<String, String> mAnnotations = new HashMap<>();
        // Default set of annotation values to use.
        private final String mDefaultAnnotation;

        public ClassInfo(final String text) {
            final String[] mapping = text.split("=", 2);
            name = mapping[0].trim();
            mDefaultAnnotation = mapping.length > 1 ? mapping[1].trim() : null;
        }

        public void addAnnotation(final String text) throws ParseException {
            final String[] mapping = text.split("=", 2);
            final String prop = mapping[0].trim();
            if (prop.isEmpty()) {
                throw new ParseException("Missing member name: " + text);
            }
            if (mapping.length < 2) {
                throw new ParseException("Missing equal sign: " + text);
            }
            if (mAnnotations.get(prop) != null) {
                throw new ParseException("Already has member: " + prop);
            }
            mAnnotations.put(prop, mapping[1].trim());
        }

        public AnnotationInfo getAnnotationInfo(final Member member) throws ParseException {
            String stubName = Utils.getNativeName(member);
            AnnotationInfo.ExceptionMode mode = AnnotationInfo.ExceptionMode.ABORT;
            AnnotationInfo.CallingThread thread = AnnotationInfo.CallingThread.ANY;
            AnnotationInfo.DispatchTarget target = AnnotationInfo.DispatchTarget.CURRENT;
            boolean noLiteral = false;
            boolean isGeneric = false;

            final String name = Utils.getMemberName(member);
            String annotation = mAnnotations.get(
                    name + (member instanceof Field ? ":" : "") + Utils.getSignature(member));
            if (annotation == null) {
                // Match name without signature
                annotation = mAnnotations.get(name);
            }
            if (annotation == null) {
                // Match <constructor>, <field>, <method>
                annotation = mAnnotations.get("<" + member.getClass().getSimpleName()
                                                          .toLowerCase(Locale.ROOT) + '>');
                isGeneric = true;
            }
            if (annotation == null) {
                // Fallback on class options, if any.
                annotation = mDefaultAnnotation;
            }
            if (annotation == null || annotation.isEmpty()) {
                return new AnnotationInfo(stubName, mode, thread, target, noLiteral);
            }

            final String[] elements = annotation.split(",");
            for (final String element : elements) {
                final String[] pair = element.split(":", 2);
                if (pair.length < 2) {
                    throw new ParseException("Missing option value: " + element);
                }
                final String pairName = pair[0].trim();
                final String pairValue = pair[1].trim();
                switch (pairName) {
                    case "skip":
                        if (Boolean.valueOf(pairValue)) {
                            // Return null to signal skipping current method.
                            return null;
                        }
                        break;
                    case "stubName":
                        if (isGeneric) {
                            // Prevent specifying stubName for class options.
                            throw new ParseException("stubName doesn't make sense here: " +
                                                     pairValue);
                        }
                        stubName = pairValue;
                        break;
                    case "exceptionMode":
                        mode = Utils.getEnumValue(AnnotationInfo.ExceptionMode.class,
                                                  pairValue);
                        break;
                    case "calledFrom":
                        thread = Utils.getEnumValue(AnnotationInfo.CallingThread.class,
                                                    pairValue);
                        break;
                    case "dispatchTo":
                        target = Utils.getEnumValue(AnnotationInfo.DispatchTarget.class,
                                                    pairValue);
                        break;
                    case "noLiteral":
                        noLiteral = Boolean.valueOf(pairValue);
                        break;
                    default:
                        throw new ParseException("Unknown option: " + pairName);
                }
            }
            return new AnnotationInfo(stubName, mode, thread, target, noLiteral);
        }
    }

    public static void main(String[] args) throws Exception {
        // We expect a list of jars on the commandline. If missing, whinge about it.
        if (args.length < 5) {
            System.err.println("Usage: java SDKProcessor sdkjar configfile outdir fileprefix max-sdk-version");
            System.exit(1);
        }

        System.out.println("Processing platform bindings...");

        String sdkJar = args[0];
        String outdir = args[2];
        String generatedFilePrefix = args[3];
        sMaxSdkVersion = Integer.parseInt(args[4]);

        LintCliClient lintClient = new LintCliClient();
        sApiLookup = ApiLookup.get(lintClient);

        // Start the clock!
        long s = System.currentTimeMillis();

        // Get an iterator over the classes in the jar files given...
        // Iterator<ClassWithOptions> jarClassIterator = IterableJarLoadingURLClassLoader.getIteratorOverJars(args);

        StringBuilder headerFile = new StringBuilder(GENERATED_COMMENT);
        headerFile.append(
                "#ifndef " + generatedFilePrefix + "_h__\n" +
                "#define " + generatedFilePrefix + "_h__\n" +
                "\n" +
                "#include \"mozilla/jni/Refs.h\"\n" +
                "\n" +
                "namespace mozilla {\n" +
                "namespace java {\n" +
                "namespace sdk {\n" +
                "\n");

        StringBuilder implementationFile = new StringBuilder(GENERATED_COMMENT);
        implementationFile.append(
                "#include \"" + generatedFilePrefix + ".h\"\n" +
                "#include \"mozilla/jni/Accessors.h\"\n" +
                "\n" +
                "namespace mozilla {\n" +
                "namespace java {\n" +
                "namespace sdk {\n" +
                "\n");

        // Used to track the calls to the various class-specific initialisation functions.
        ClassLoader loader = null;
        try {
            loader = URLClassLoader.newInstance(new URL[] { new URL("file://" + sdkJar) },
                                                SDKProcessor.class.getClassLoader());
        } catch (Exception e) {
            throw new RuntimeException(e.toString());
        }

        try {
            final ClassInfo[] classes = getClassList(args[1]);
            for (final ClassInfo cls : classes) {
                System.out.println("Looking up: " + cls.name);
                generateClass(Class.forName(cls.name, true, loader),
                              cls,
                              implementationFile,
                              headerFile);
            }
        } catch (final IllegalStateException|IOException|ParseException e) {
            System.err.println("***");
            System.err.println("*** Error parsing config file: " + args[1]);
            System.err.println("*** " + e);
            System.err.println("***");
            if (e.getCause() != null) {
                e.getCause().printStackTrace(System.err);
            }
            System.exit(1);
            return;
        }

        implementationFile.append(
                "} /* sdk */\n" +
                "} /* java */\n" +
                "} /* mozilla */\n");

        headerFile.append(
                "} /* sdk */\n" +
                "} /* java */\n" +
                "} /* mozilla */\n" +
                "#endif\n");

        writeOutputFiles(outdir, generatedFilePrefix, headerFile, implementationFile);
        long e = System.currentTimeMillis();
        System.out.println("SDK processing complete in " + (e - s) + "ms");
    }

    private static int getAPIVersion(Class<?> cls, Member m) {
        if (m instanceof Method || m instanceof Constructor) {
            return sApiLookup.getCallVersion(
                    cls.getName().replace('.', '/'),
                    Utils.getMemberName(m),
                    Utils.getSignature(m));
        } else if (m instanceof Field) {
            return sApiLookup.getFieldVersion(
                    Utils.getClassDescriptor(m.getDeclaringClass()), m.getName());
        } else {
            throw new IllegalArgumentException("expected member to be Method, Constructor, or Field");
        }
    }

    private static Member[] sortAndFilterMembers(Class<?> cls, Member[] members) {
        Arrays.sort(members, new Comparator<Member>() {
            @Override
            public int compare(Member a, Member b) {
                int result = a.getName().compareTo(b.getName());
                if (result == 0) {
                    if (a instanceof Constructor && b instanceof Constructor) {
                        String sa = Arrays.toString(((Constructor) a).getParameterTypes());
                        String sb = Arrays.toString(((Constructor) b).getParameterTypes());
                        result = sa.compareTo(sb);
                    } else if (a instanceof Method && b instanceof Method) {
                        String sa = Arrays.toString(((Method) a).getParameterTypes());
                        String sb = Arrays.toString(((Method) b).getParameterTypes());
                        result = sa.compareTo(sb);
                    }
                }
                return result;
            }
        });

        ArrayList<Member> list = new ArrayList<>();
        for (final Member m : members) {
            if (m.getDeclaringClass() == Object.class) {
                // Skip methods from Object.
                continue;
            }

            // Sometimes (e.g. Bundle) has methods that moved to/from a superclass in a later SDK
            // version, so we check for both classes and see if we can find a minimum SDK version.
            int version = getAPIVersion(cls, m);
            final int version2 = getAPIVersion(m.getDeclaringClass(), m);
            if (version2 > 0 && version2 < version) {
                version = version2;
            }
            if (version > sMaxSdkVersion) {
                System.out.println("Skipping " + m.getDeclaringClass().getName() + "." +
                                   Utils.getMemberName(m) + ", version " + version + " > " +
                                   sMaxSdkVersion);
                continue;
            }

            // Sometimes (e.g. KeyEvent) a field can appear in both a class and a superclass. In
            // that case we want to filter out the version that appears in the superclass, or
            // we'll have bindings with duplicate names.
            try {
                if (m instanceof Field && !m.equals(cls.getField(m.getName()))) {
                    // m is a field in a superclass that has been hidden by
                    // a field with the same name in a subclass.
                    System.out.println("Skipping " + Utils.getMemberName(m) +
                                       " from " + m.getDeclaringClass().getName());
                    continue;
                }
            } catch (final NoSuchFieldException e) {
            }

            list.add(m);
        }

        return list.toArray(new Member[list.size()]);
    }

    private static void generateMembers(CodeGenerator generator, ClassInfo clsInfo,
                                        Member[] members) throws ParseException {
        for (Member m : members) {
            if (!Modifier.isPublic(m.getModifiers())) {
                continue;
            }

            // Default for SDK bindings.
            final AnnotationInfo info = clsInfo.getAnnotationInfo(m);
            if (info == null) {
                // Skip this member.
                continue;
            }
            final AnnotatableEntity entity = new AnnotatableEntity(m, info);

            if (m instanceof Constructor) {
                generator.generateConstructor(entity);
            } else if (m instanceof Method) {
                generator.generateMethod(entity);
            } else if (m instanceof Field) {
                generator.generateField(entity);
            } else {
                throw new IllegalArgumentException(
                        "expected member to be Constructor, Method, or Field");
            }
        }
    }

    private static void generateClass(Class<?> clazz,
                                      ClassInfo clsInfo,
                                      StringBuilder implementationFile,
                                      StringBuilder headerFile) throws ParseException {
        String generatedName = clazz.getSimpleName();

        CodeGenerator generator = new CodeGenerator(
                new ClassWithOptions(clazz, generatedName, /* ifdef */ ""));

        generateMembers(generator, clsInfo,
                        sortAndFilterMembers(clazz, clazz.getConstructors()));
        generateMembers(generator, clsInfo, sortAndFilterMembers(clazz, clazz.getMethods()));
        generateMembers(generator, clsInfo, sortAndFilterMembers(clazz, clazz.getFields()));

        headerFile.append(generator.getHeaderFileContents());
        implementationFile.append(generator.getWrapperFileContents());
    }

    private static ClassInfo[] getClassList(BufferedReader reader)
            throws ParseException, IOException {
        final ArrayList<ClassInfo> classes = new ArrayList<>();
        ClassInfo currentClass = null;
        String line;

        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) {
                continue;
            }
            switch (line.charAt(0)) {
                case ';':
                case '#':
                    // Comment
                    continue;
                case '[':
                    // New section
                    if (line.charAt(line.length() - 1) != ']') {
                        throw new ParseException("Missing trailing ']': " + line);
                    }
                    currentClass = new ClassInfo(line.substring(1, line.length() - 1));
                    classes.add(currentClass);
                    break;
                default:
                    // New mapping
                    if (currentClass == null) {
                        throw new ParseException("Missing class: " + line);
                    }
                    currentClass.addAnnotation(line);
                    break;
            }
        }
        if (classes.isEmpty()) {
            throw new ParseException("No class found in config file");
        }
        return classes.toArray(new ClassInfo[classes.size()]);
    }

    private static ClassInfo[] getClassList(final String path)
            throws ParseException, IOException {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(path));
            return getClassList(reader);
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
    }

    private static void writeOutputFiles(String aOutputDir, String aPrefix, StringBuilder aHeaderFile,
                                         StringBuilder aImplementationFile) {
        FileOutputStream implStream = null;
        try {
            implStream = new FileOutputStream(new File(aOutputDir, aPrefix + ".cpp"));
            implStream.write(aImplementationFile.toString().getBytes());
        } catch (IOException e) {
            System.err.println("Unable to write " + aOutputDir + ". Perhaps a permissions issue?");
            e.printStackTrace(System.err);
        } finally {
            if (implStream != null) {
                try {
                    implStream.close();
                } catch (IOException e) {
                    System.err.println("Unable to close implStream due to "+e);
                    e.printStackTrace(System.err);
                }
            }
        }

        FileOutputStream headerStream = null;
        try {
            headerStream = new FileOutputStream(new File(aOutputDir, aPrefix + ".h"));
            headerStream.write(aHeaderFile.toString().getBytes());
        } catch (IOException e) {
            System.err.println("Unable to write " + aOutputDir + ". Perhaps a permissions issue?");
            e.printStackTrace(System.err);
        } finally {
            if (headerStream != null) {
                try {
                    headerStream.close();
                } catch (IOException e) {
                    System.err.println("Unable to close headerStream due to "+e);
                    e.printStackTrace(System.err);
                }
            }
        }
    }
}
