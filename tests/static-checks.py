#!/usr/bin/env python3
"""Dependency-free checks for the GitHub Pages project path and page metadata."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://salstar07.github.io/systems-analysis-portfolio/'
CASE_SECTIONS = [
    'challenge', 'role', 'approach', 'solution', 'implementation',
    'testing', 'evidence', 'outcome', 'limitations',
]
NEW_CASES = {'employee-check-in.html', 'teams-archiving.html', 'vehicle-booking.html'}


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.refs = []
        self.metadata = {}
        self.canonical = None
        self.headings = 0
        self.sections = []
        self.elements = []
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.elements.append((tag, attrs))
        if tag == 'section' and attrs.get('id'):
            self.sections.append(attrs['id'])
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.headings += 1
        if tag == 'meta':
            self.metadata[attrs.get('property', attrs.get('name'))] = attrs.get('content')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        for key in ('src', 'href'):
            if key in attrs:
                self.refs.append(attrs[key])


def main():
    sources = [ROOT / 'index.html', *sorted((ROOT / 'work').glob('*.html'))]
    assert len(sources) == 8, 'Expected the homepage and seven case studies'
    pages = {p: Page(p.read_text()) for p in sources}
    checked = 0
    for source, page in pages.items():
        relative = source.relative_to(ROOT).as_posix()
        if source.parent.name == 'work':
            assert all(section in page.sections for section in CASE_SECTIONS), f'{relative}: missing case-study section'
            ordered = [section for section in page.sections if section in CASE_SECTIONS]
            assert ordered == CASE_SECTIONS, f'{relative}: case-study reading order: {ordered}'
            if source.name in NEW_CASES:
                assert 'evidence-checklist' in page.ids, f'{relative}: missing evidence checklist'
        else:
            assert 'more-projects' in page.ids, 'Homepage: missing additional projects section'
            featured = [attrs for _, attrs in page.elements if 'project-card' in attrs.get('class', '').split() and 'data-category' in attrs]
            additional = [attrs for _, attrs in page.elements if 'additional-project-card' in attrs.get('class', '').split()]
            assert len(featured) == 4, 'Homepage: preserve four featured projects'
            assert len(additional) == 3, 'Homepage: expected three additional project cards'
        assert page.headings == 1, f'{relative}: expected one h1'
        assert not [name for name, n in Counter(page.ids).items() if n > 1], f'{relative}: duplicate IDs'
        assert page.metadata.get('description'), f'{relative}: missing description'
        assert page.metadata.get('og:title'), f'{relative}: missing social title'
        assert page.metadata.get('og:description'), f'{relative}: missing social description'
        assert page.metadata.get('twitter:card') == 'summary_large_image', f'{relative}: social card'
        expected = SITE if relative == 'index.html' else SITE + relative
        assert page.canonical == expected, f'{relative}: canonical path'
        assert page.metadata.get('og:url') == expected, f'{relative}: social URL'
        assert page.metadata.get('og:image') == SITE + 'assets/og-card.png', f'{relative}: social image'
        assert page.metadata.get('twitter:image') == SITE + 'assets/og-card.png', f'{relative}: Twitter image'
        for ref in page.refs:
            target = urlsplit(ref)
            if target.scheme or target.netloc:
                continue
            if target.path.startswith('/'):
                prefix = '/systems-analysis-portfolio/'
                assert target.path.startswith(prefix), f'{relative}: escapes project base: {ref}'
                local = ROOT / unquote(target.path[len(prefix):])
            else:
                local = source.parent / unquote(target.path) if target.path else source
            local = local.resolve()
            assert local.is_relative_to(ROOT), f'{relative}: escapes checkout: {ref}'
            if local.is_dir():
                local /= 'index.html'
            assert local.is_file(), f'{relative}: missing target: {ref}'
            if target.fragment:
                assert local in pages and unquote(target.fragment) in pages[local].ids, f'{relative}: broken fragment: {ref}'
            checked += 1
    assert (ROOT / '.nojekyll').is_file(), 'Preserve GitHub Pages static configuration'
    for script in ['assets/main.js', 'assets/capacity-rules.js', 'tests/browser-checks.cjs']:
        subprocess.run(['node', '--check', str(ROOT / script)], check=True)
    script = 'JSON.stringify(require("./assets/capacity-rules.js").runChecks())'
    checks = json.loads(subprocess.check_output(['node', '-p', script], cwd=ROOT, text=True))
    assert len(checks) == 14 and all(c['passed'] for c in checks), checks
    print(f'PASS: {len(pages)} pages, {checked} local links/assets/fragments, seven consistent case studies, three evidence checklists, project-path SEO metadata, JavaScript syntax and 14 existing rules.')


if __name__ == '__main__':
    main()
