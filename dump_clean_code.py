import os

# Finalized script to dump clean project files, explicitly ignoring unwanted directories and files.

IGNORE_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    ".mypy_cache",
    ".idea",
    ".vscode",
    "migrations",
    "instance",
}
# Also ignore any directory name containing 'venv' just in case
IGNORE_DIR_KEYWORD = "venv"

IGNORE_EXTENSIONS = {
    ".pyc",
    ".log",
    ".sqlite3",
    ".db",
    ".pem",
    ".key",
    ".DS_Store",
    ".cfg",
    ".so",
    ".pyd",
    ".h",
    ".dll",
}
INCLUDE_EXTENSIONS = {
    ".py",
    ".html",
    ".js",
    ".css",
    ".md",
    ".txt",
    ".json",
    ".yml",
    ".yaml",
    ".env",
    ".ini",
}

OUTPUT_FILE = "CLEAN_project_dump.txt"


def should_include_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext in IGNORE_EXTENSIONS or ext not in INCLUDE_EXTENSIONS:
        return False
    return True


def collect_files(base_dir="."):
    clean_files = []
    for root, dirs, files in os.walk(base_dir):
        # Normalize dir names for filtering
        filtered_dirs = []
        for d in dirs:
            ld = d.lower()
            if d in IGNORE_DIRS or IGNORE_DIR_KEYWORD in ld:
                continue
            filtered_dirs.append(d)
        dirs[:] = filtered_dirs

        for file in files:
            full_path = os.path.join(root, file)
            # Skip if any part of the path contains ignored dir
            if any(
                part in IGNORE_DIRS or IGNORE_DIR_KEYWORD in part.lower()
                for part in full_path.split(os.sep)
            ):
                continue
            if should_include_file(full_path):
                clean_files.append(full_path)
    return clean_files


def dump_files(files, output_path):
    with open(output_path, "w", encoding="utf-8") as outfile:
        for path in files:
            outfile.write(f"\n===== {path} =====\n")
            try:
                with open(path, "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"[Error reading file: {e}]\n")


if __name__ == "__main__":
    print("📦 Collecting project files...")
    files = collect_files()
    dump_files(files, OUTPUT_FILE)
    print(f"✅ Done. Output saved to: {OUTPUT_FILE}")
