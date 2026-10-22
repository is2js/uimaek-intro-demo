"""Build the standalone intro. No game imports, network, account or database required."""
from __future__ import annotations

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import urlsplit

from jinja2 import Environment, FileSystemLoader, select_autoescape
from jsonschema import Draft202012Validator

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from rpg_intro_content import read_json, validate_intro_catalog


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def base_path(value: str) -> str:
    if not re.fullmatch(r"/[A-Za-z0-9_/-]*", value) or ".." in value or "//" in value:
        raise ValueError("base-path must be an absolute URL path, for example /uimaek-intro-demo/")
    return value.rstrip("/") + "/"


def scope_urls(value, prefix: str):
    if isinstance(value, dict):
        return {key: scope_urls(item, prefix) for key, item in value.items()}
    if isinstance(value, list):
        return [scope_urls(item, prefix) for item in value]
    if isinstance(value, str) and value.startswith(("/assets/", "/src/")):
        return prefix + value.lstrip("/")
    return value


def validate(root: Path) -> tuple[dict, dict]:
    data = read_json(root / "data/content.json")
    schema = read_json(root / "schema/schema.json")
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema).validate(data)
    validate_intro_catalog(data, root, content_dir=root / "schema")
    manifest = json.loads((root / "export-manifest.json").read_text(encoding="utf-8"))
    known = set()
    for item in manifest["files"]:
        relative = item["path"]
        path = (root / relative).resolve()
        if not path.is_relative_to(root.resolve()) or not path.is_file():
            raise ValueError(f"Missing or unsafe demo asset: {relative}")
        if relative.casefold() in known:
            raise ValueError(f"Duplicate or case-colliding demo asset: {relative}")
        known.add(relative.casefold())
        if digest(path) != item["sha256"]:
            raise ValueError(f"Asset changed without re-export: {relative}")
    def references(value):
        if isinstance(value, dict):
            for item in value.values():
                yield from references(item)
        elif isinstance(value, list):
            for item in value:
                yield from references(item)
        elif isinstance(value, str) and value.startswith('/assets/') and value != '/assets/':
            yield urlsplit(value).path.lstrip('/')
    for relative in set(references(data)):
        if relative.casefold() not in known:
            raise ValueError(f"Content asset is not in the exported closure: {relative}")
    return data, manifest


def build(root: Path, output: Path, prefix: str = "/") -> dict:
    prefix = base_path(prefix)
    data, manifest = validate(root)
    # A fixed demo deployment prevents a JSON edit from turning a CTA into a real login.
    data = scope_urls(deepcopy(data), prefix)
    data["deployment"] = {"mode": "demo", "basePath": prefix}
    data["assetBase"] = prefix + "assets/"
    environment = Environment(loader=FileSystemLoader(root / "templates"), autoescape=select_autoescape())
    page = environment.get_template("rpg-intro.html").render(
        intro_data=data, landing_is_logged_in=False, landing_is_operator=False,
    )
    # These URLs are fixed presentation dependencies in the shared template/CSS.
    page = re.sub(r"(?<=[\"'])/(assets|src)/", lambda match: prefix + match[1] + "/", page)
    # Block service navigation in the complete generated markup, including noscript.
    if re.search(r'(?:href|action)=[\"\']/(?:play|rpg)(?:[/?#\"\'])', page):
        raise ValueError("Demo HTML still contains a real service link")
    output = output.resolve()
    if output == root.resolve() or root.resolve().is_relative_to(output):
        raise ValueError("Build output must be a child or separate output directory")
    output.mkdir(parents=True, exist_ok=True)
    for item in manifest["files"]:
        relative = item["path"]
        if not relative.startswith(("assets/", "src/")):
            continue
        source, destination = root / relative, output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == ".css":
            text = source.read_text(encoding="utf-8")
            text = re.sub(r"(?<=[\"'(])/(assets|src)/", lambda match: prefix + match[1] + "/", text)
            destination.write_text(text, encoding="utf-8", newline="\n")
        else:
            shutil.copyfile(source, destination)
    (output / "index.html").write_text(page, encoding="utf-8", newline="\n")
    (output / ".nojekyll").write_bytes(b"")
    (output / "content.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return {"output": str(output), "basePath": prefix, "files": len(manifest["files"]),
            "assetBytes": manifest["assetBytes"], "mode": "demo"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path)
    parser.add_argument("--base-path", default="/")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    if args.check:
        data, manifest = validate(root)
        print(json.dumps({"valid": True, "schemaVersion": data["schemaVersion"], "files": len(manifest["files"])}, ensure_ascii=False))
    else:
        print(json.dumps(build(root, args.output or root / "dist", args.base_path), ensure_ascii=False))


if __name__ == "__main__":
    main()
