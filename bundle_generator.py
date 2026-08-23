import os
import shutil
import zipfile
import json

BASE_DIR = os.path.abspath(".")
EXCLUDE_DIRS = {'node_modules', '.git', 'dist', 'export_packages', '.cache'}
EXCLUDE_EXTS = {'.zip', '.lock', '.log'}

def create_zip(source_dir, output_zip, prefix=""):
    os.makedirs(os.path.dirname(output_zip), exist_ok=True)
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                if prefix:
                    arcname = os.path.join(prefix, rel_path)
                else:
                    arcname = rel_path
                z.write(full_path, arcname)

# 1. Main Project ZIP
public_zip = os.path.join(BASE_DIR, "public", "bring_my_bite_complete_project.zip")
create_zip(BASE_DIR, public_zip)

# 2. Public downloads folder
downloads_dir = os.path.join(BASE_DIR, "public", "downloads")
os.makedirs(downloads_dir, exist_ok=True)
create_zip(BASE_DIR, os.path.join(downloads_dir, "website_code.zip"), prefix="website")
create_zip(BASE_DIR, os.path.join(downloads_dir, "application_android.zip"), prefix="android_app")
create_zip(BASE_DIR, os.path.join(downloads_dir, "application_ios.zip"), prefix="ios_app")
shutil.copy2(public_zip, os.path.join(downloads_dir, "bring_my_bite_all_complete.zip"))

print("All archives generated cleanly and fast!")
