# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import shutil
import subprocess
import tempfile

TARGET = "mozjs"

def extract_tarball(tarball):
    print("Extracting tarball.")

    if not os.path.exists(tarball):
        raise Exception("Tarball not found at %s" % tarball)

    if os.path.exists(TARGET):
        shutil.rmtree(TARGET)

    with tempfile.TemporaryDirectory() as directory:
        subprocess.check_call(["tar", "-xjf", tarball, "-C", directory])

        contents = os.listdir(directory)
        if len(contents) != 1:
            raise Exception("Found more than one directory in the tarball: %s" %
                            ", ".join(contents))
        subdirectory = contents[0]

        shutil.copytree(os.path.join(directory, subdirectory), TARGET)

    subprocess.check_call(["git", "add", "--all", TARGET], stdout=subprocess.DEVNULL)
    subprocess.check_call(["git", "commit", "-m", "Update SpiderMonkey"], stdout=subprocess.DEVNULL)

def apply_patches():
    print("Applying patches.")

    patch_dir = os.path.abspath(os.path.join("etc", "patches"))
    patches = sorted(
        os.path.join(patch_dir, p)
        for p in os.listdir(patch_dir)
        if p.endswith(".patch")
    )

    for p in patches:
        print("  Applying patch: %s." % p)
        subprocess.check_call(["git", "am", p], stdout=subprocess.DEVNULL)

def generate_configure():
    print("Generating configure.")

    cwd = os.path.join(TARGET, "js", "src")

    try:
        subprocess.check_call(["autoconf2.13"], cwd=cwd)
    except FileNotFoundError:
        subprocess.check_call(["autoconf-2.13"], cwd=cwd)

    subprocess.check_call(["git", "add", os.path.join(cwd, "configure")], stdout=subprocess.DEVNULL)

    with open(os.path.join(cwd, "old-configure"), "w") as old_configure:
        try:
            subprocess.check_call(["autoconf2.13", "old-configure.in"], cwd=cwd, stdout=old_configure)
        except FileNotFoundError:
            subprocess.check_call(["autoconf-2.13", "old-configure.in"], cwd=cwd, stdout=old_configure)

        subprocess.check_call(["git", "add", os.path.join(cwd, "old-configure")], stdout=subprocess.DEVNULL)

    subprocess.check_call(["git", "commit", "-m", "Generate configure."], stdout=subprocess.DEVNULL)

def main(args):
    extract_tarball(os.path.abspath(args[0]))
    apply_patches()
    generate_configure()

if __name__ == "__main__":
    import sys
    main(sys.argv[1:])
