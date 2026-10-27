"""Validate the deployable static site using only the Python standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=set(); self.duplicates=[]; self.refs=[]; self.h1=0; self.description=False; self.canonical=False; self.image_errors=[]; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids:self.duplicates.append(a['id'])
            self.ids.add(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='meta' and a.get('name')=='description':self.description=bool(a.get('content'))
        if tag=='link' and a.get('rel')=='canonical':self.canonical=True
        if tag=='img' and any(k not in a for k in ('alt','width','height')):self.image_errors.append(a.get('src'))
        for key in ('href','src'):
            if a.get(key):self.refs.append(a[key])
pages={p:Page(p.read_text()) for p in ROOT.rglob('*.html')}
errors=[]
for path,page in pages.items():
    name=str(path.relative_to(ROOT))
    if page.h1!=1:errors.append(f'{name}: expected one h1, got {page.h1}')
    if not(page.description and page.canonical):errors.append(f'{name}: missing metadata')
    if page.duplicates:errors.append(f'{name}: duplicate IDs {page.duplicates}')
    if page.image_errors:errors.append(f'{name}: image needs alt/dimensions {page.image_errors}')
    for raw in page.refs:
        u=urlsplit(raw)
        if u.scheme or u.netloc:continue
        target=(path.parent/unquote(u.path)).resolve() if u.path else path
        if target.is_dir():target/= 'index.html'
        if not target.exists():errors.append(f'{name}: missing target {raw}');continue
        if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{name}: missing anchor {raw}')
for needed in ('assets/Rafayet_Murtaza_Resume.pdf','assets/social-preview.png','sitemap.xml'):
    if not (ROOT/needed).is_file():errors.append(f'Missing {needed}')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} pages; internal links, anchors, metadata, image labels/dimensions, and required assets.')
