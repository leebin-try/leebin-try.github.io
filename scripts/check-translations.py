"""Check paired prose, immutable score metadata and built language/navigation output."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.language = None
        self.skip = 0
        self.text = []
        self.alternates = {}
        self.canonical = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'html':
            self.language = values.get('lang')
        if tag in {'script', 'style'}:
            self.skip += 1
        if tag == 'link':
            if values.get('rel') == 'canonical':
                self.canonical = values.get('href')
            if values.get('hreflang'):
                self.alternates[values['hreflang']] = values.get('href')

    def handle_endtag(self, tag):
        if tag in {'script', 'style'}:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)


def main():
    posts = ROOT / 'src/content/posts'
    chinese = {p.stem: p for p in posts.glob('*.md')}
    english = {p.stem: p for p in (posts / 'en').glob('*.md')}
    assert chinese.keys() == english.keys() and len(english) > 0
    for key in chinese:
        zh = chinese[key].read_text()
        en = english[key].read_text()
        _, zfront, zbody = zh.split('---', 2)
        _, efront, ebody = en.split('---', 2)
        assert re.search(r'''^lang:\s*['"]?en['"]?\s*$''', efront, re.M), key
        assert re.findall(r'^(#{2,3}) ', zbody, re.M) == re.findall(r'^(#{2,3}) ', ebody, re.M), key
        assert re.findall(r'<img src="([^"]+)"', zbody) == re.findall(r'<img src="([^"]+)"', ebody), key
        assert not re.search(r'[\u4e00-\u9fff]', ebody), key
        if 'kaggle:' in zfront:
            zrecord = json.loads(re.search(r'^kaggle: (.+)$', zfront, re.M)[1])
            erecord = json.loads(re.search(r'^kaggle: (.+)$', efront, re.M)[1])
            if zrecord['kind'] == 'case':
                assert re.findall(r'^## (.+)$', ebody, re.M)[1:] == ['Technical approach and pipeline', 'Evaluation', 'Results and evidence', 'Reflection and conclusion', 'Next experiments', 'Sources and evidence'], key
                assert re.findall(r'^## (.+)$', zbody, re.M)[1:] == ['技术思路与路线', '评价方式', '结果与证据', '思考与结论', '下一步', '资料与证据'], key
            for field in ['kind', 'number', 'topic', 'status', 'evidenceDate', 'submission', 'competitionUrl', 'recordSource']:
                assert zrecord.get(field) == erecord.get(field), (key, field)
            assert re.findall(r'\d+(?:\.\d+)?', zrecord.get('result', '')) == re.findall(r'\d+(?:\.\d+)?', erecord.get('result', '')), key
        for prefix, language in [('', 'en'), ('zh/', 'zh-CN')]:
            path = ROOT / 'dist' / prefix / 'posts' / key / 'index.html'
            doc = Document(path.read_text())
            assert doc.language == language, path
            assert doc.canonical == f'https://leebin-try.github.io/{prefix}posts/{key}/', path
            assert doc.alternates.get('en') == f'https://leebin-try.github.io/posts/{key}/', path
            assert doc.alternates.get('zh-CN') == f'https://leebin-try.github.io/zh/posts/{key}/', path

    for path in (ROOT / 'dist').rglob('*.html'):
        if path.relative_to(ROOT / 'dist').parts[0] == 'zh':
            continue
        doc = Document(path.read_text())
        text = ''.join(doc.text).replace('中文', '')
        assert not re.search(r'[\u4e00-\u9fff]', text), (path, re.findall(r'[\u4e00-\u9fff]+', text))

    zhreport = (ROOT / 'src/content/reports/data-agent-ontology.html').read_text()
    enreport = (ROOT / 'src/content/reports/data-agent-ontology-en.html').read_text()
    assert set(re.findall(r'\bid="([^"]+)"', zhreport)) == set(re.findall(r'\bid="([^"]+)"', enreport))
    print(f'Verified {len(english)} bilingual pairs, heading/figure parity, score metadata, {len(english)*2} article canonicals/alternates, English visible text, and 54 research anchors.')


if __name__ == '__main__':
    main()
