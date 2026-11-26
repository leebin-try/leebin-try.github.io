"""Audit published figure integrity and all local links in the built site.

Standard library only. Optionally verify private source hashes with --source-root.
"""
import argparse
import csv
import hashlib
import json
import struct
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = set(), []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if tag == "img" and "src" in attrs:
            self.links.append(attrs["src"])


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path)
    args = parser.parse_args()
    raw = (ROOT / "src/data/kaggle-figures.json").read_bytes()
    assert raw == (ROOT / "public/kaggle/figures.json").read_bytes()
    figures = json.loads(raw)
    counts = Counter(item["kind"] for item in figures)
    assert counts == {"original_cover": 20, "original_method_diagram": 20,
                      "recorded_aggregate_metrics": 16}, counts
    assert len({item["id"] for item in figures}) == len(figures)
    for figure in figures:
        image = ROOT / "public" / figure["file"].lstrip("/")
        assert digest(image) == figure["sha256"], image
        tree = ET.fromstring(image.read_bytes())
        for node in tree.iter():
            assert node.tag.rsplit("}", 1)[-1] not in {"script", "foreignObject"}, image
            for key, value in node.attrib.items():
                assert not key.lower().startswith("on"), image
                if key.rsplit("}", 1)[-1] == "href":
                    # Matplotlib embeds heatmap cells as an inline PNG; no network resource.
                    assert value.startswith(("#", "data:image/png;base64,")), image
        if figure["kind"] == "original_cover":
            png = image.with_suffix(".png").read_bytes()
            assert png[:8] == b"\x89PNG\r\n\x1a\n", image
            assert struct.unpack(">II", png[16:24]) == (1200, 675), image
        if "data" in figure:
            data = ROOT / "public" / figure["data"].lstrip("/")
            assert digest(data) == figure["dataSha256"], data
            with data.open(newline="") as stream:
                reader = csv.DictReader(stream)
                assert reader.fieldnames == figure["fields"], data
                rows = list(reader)
                assert len(rows) == figure["rows"], data
                assert all(None not in row for row in rows), data
            for source in figure["sources"]:
                relative = Path(source["path"])
                assert not relative.is_absolute() and ".." not in relative.parts
                if args.source_root:
                    assert digest(args.source_root / relative) == source["sha256"], relative

    dist = ROOT / "dist"
    pages = {path: Page(path.read_text()) for path in dist.rglob("*.html")}
    checks = 0
    for path, page in pages.items():
        base = "/" + path.relative_to(dist).as_posix()
        for href in page.links:
            url = urlsplit(urljoin("https://leebin-try.github.io" + base, href))
            if url.scheme not in {"http", "https"} or url.netloc != "leebin-try.github.io":
                continue
            target = dist / unquote(url.path).lstrip("/")
            if target.is_dir():
                target /= "index.html"
            assert target.is_file(), (path.relative_to(dist), href)
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, (path.relative_to(dist), href)
            checks += 1
    print(f"Verified {len(figures)} figure hashes, 16 metric exports, 20 PNG covers; "
          f"{checks} local links/images/anchors across {len(pages)} built HTML pages.")


if __name__ == "__main__":
    main()
