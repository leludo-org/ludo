#!/usr/bin/env python3
"""Cache-bust: strip old checksums, compute new ones, rename files, update all references.
Run from repo root after editing any JS file."""

import os, hashlib, re, glob, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

DIRS = ["docs/components", "docs/scripts"]
EXTRA_REF_FILES = ["docs/test/test.js", "docs/test/index.html"]
CHECKSUM_RE = re.compile(r'^(.+)\.[a-f0-9]{8}\.js$')
IMPORT_CHECKSUM_RE = re.compile(r'\.[a-f0-9]{8}\.js')
PATH_CHAR = r'[A-Za-z0-9_./\\-]'


def read_file(p):
    with open(p, 'r') as f:
        return f.read()


def write_file(p, content):
    with open(p, 'w') as f:
        f.write(content)


def strip_checksum(fname):
    m = CHECKSUM_RE.match(fname)
    return m.group(1) + '.js' if m else fname


def compute_hash(content):
    normalized = IMPORT_CHECKSUM_RE.sub('.js', content)
    return hashlib.md5(normalized.encode()).hexdigest()[:8]


# Step 1: Discover JS files, group by base (no checksum). Detect duplicates.
current_files = {}  # base_path -> actual_path
duplicates = []
for d in DIRS:
    for f in sorted(glob.glob(os.path.join(d, '*.js'))):
        fname = os.path.basename(f)
        base_path = os.path.join(d, strip_checksum(fname))
        if base_path in current_files:
            duplicates.append((current_files[base_path], f))
        current_files[base_path] = f

if duplicates:
    print("ERROR: duplicate base names on disk:", file=sys.stderr)
    for a, b in duplicates:
        print(f"  {a} <-> {b}", file=sys.stderr)
    sys.exit(1)

# Step 2: Collect every file that may contain references
all_ref_files = []
for d in DIRS:
    all_ref_files.extend(sorted(glob.glob(os.path.join(d, '*.js'))))
all_ref_files.append('docs/index.html')
all_ref_files.extend(f for f in EXTRA_REF_FILES if os.path.exists(f))
all_ref_files = list(dict.fromkeys(all_ref_files))  # dedupe, preserve order

# Step 3: Read once, compute hashes from normalized content
file_contents = {p: read_file(p) for p in all_ref_files}

dir_new_names = {}  # (dir_short, base) -> new_fname
rename_map = {}
for base_path, old_path in current_files.items():
    d = os.path.dirname(base_path)
    base = os.path.basename(base_path)
    name = base[:-3]  # strip '.js'
    h = compute_hash(file_contents[old_path])
    new_fname = f"{name}.{h}.js"
    new_path = os.path.join(d, new_fname)
    rename_map[old_path] = new_path
    dir_new_names[(d.replace('docs/', ''), base)] = new_fname

# Step 4: Build anchored replacements (avoid partial-path collisions)
replacements = []  # (compiled_regex, replacement, scope_dir_or_None)
for (dir_short, base), new_fname in dir_new_names.items():
    scope = f"docs/{dir_short}"
    for old_frag, new_frag, sc in [
        (f"{dir_short}/{base}", f"{dir_short}/{new_fname}", None),
        (f"./{base}", f"./{new_fname}", scope),
        (f"../{dir_short}/{base}", f"../{dir_short}/{new_fname}", None),
    ]:
        pat = re.compile(rf'(?<!{PATH_CHAR}){re.escape(old_frag)}(?!{PATH_CHAR})')
        replacements.append((pat, new_frag, sc))

# Step 5: Strip old hashes, inject new ones, write only on change
updated = 0
for filepath in all_ref_files:
    original = file_contents[filepath]
    content = IMPORT_CHECKSUM_RE.sub('.js', original)
    filedir = os.path.dirname(filepath)
    for pat, repl, scope in replacements:
        if scope and filedir != scope:
            continue
        content = pat.sub(repl, content)
    if content != original:
        write_file(filepath, content)
        updated += 1

# Step 6: Rename files on disk
renamed = 0
for old_path, new_path in sorted(rename_map.items()):
    if old_path != new_path:
        os.rename(old_path, new_path)
        renamed += 1

print(f"Cache-bust: renamed {renamed} file(s), updated refs in {updated} file(s).")
for old_path in sorted(rename_map):
    new_path = rename_map[old_path]
    if old_path != new_path:
        print(f"  {old_path:.<55s} {os.path.basename(new_path)}")
