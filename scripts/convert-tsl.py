#!/usr/bin/env python3
# Convert TSL Anki deck → toeic.json
# Fields: Front(word), Back, Rank, Word, English Definition, Japanese Definition, POS, Synonyms

import sqlite3, json, os, re

BASE = os.path.join(os.path.dirname(__file__), '..')

def clean(s):
    s = s.replace('\xa0', ' ').replace('N/A', '').strip()
    return re.sub(r'\s+', ' ', s)

def clean_jp(s):
    """Take first meaningful translation, clean up."""
    s = clean(s)
    if not s:
        return ''
    # Take content before the first semicolon for the primary translation
    # but keep all if it's short enough
    if len(s) <= 40:
        return s
    # Take up to first semicolon
    primary = s.split(';')[0].strip()
    return primary if primary else s[:40]

conn = sqlite3.connect('/tmp/tsl_extract/collection.anki2')
rows = conn.execute('SELECT flds FROM notes').fetchall()
conn.close()

# Parse all notes
entries = []
for (flds,) in rows:
    p = flds.split('\x1f')
    word = clean(p[0]) if len(p) > 0 else ''
    rank = int(p[2]) if len(p) > 2 and p[2].strip().isdigit() else 9999
    defn = clean(p[4]) if len(p) > 4 else ''
    jp   = clean_jp(p[5]) if len(p) > 5 else ''
    if not word:
        continue
    entries.append({'word': word, 'rank': rank, 'definition': defn, 'translation': jp})

# Sort by rank
entries.sort(key=lambda e: e['rank'])

total = len(entries)
third = total // 3

# Assign levels by rank (rank 1 = most common = easiest)
for i, e in enumerate(entries):
    e['level'] = 1 if i < third else (2 if i < third * 2 else 3)

# Stats
l1 = sum(1 for e in entries if e['level'] == 1)
l2 = sum(1 for e in entries if e['level'] == 2)
l3 = sum(1 for e in entries if e['level'] == 3)
no_def = sum(1 for e in entries if not e['definition'])
no_jp  = sum(1 for e in entries if not e['translation'])

print(f'TSL: {total} words')
print(f'  Level distribution: ★={l1} ★★={l2} ★★★={l3}')
print(f'  Missing def: {no_def}, missing JP: {no_jp}')
print(f'  Rank 1-5: {[e["word"] for e in entries[:5]]}')
print(f'  L1 sample: {[e["word"] for e in entries if e["level"]==1][:8]}')
print(f'  L2 sample: {[e["word"] for e in entries if e["level"]==2][:8]}')
print(f'  L3 sample: {[e["word"] for e in entries if e["level"]==3][:8]}')

# Build output
out = {
    'category': 'toeic',
    'source': 'TSL v1.1 (TOEIC Service List) CC BY-SA 4.0 — newgeneralservicelist.org',
    'words': [
        {
            'id': f't{i+1:04d}',
            'word': e['word'],
            'translation': e['translation'],
            'definition': e['definition'],
            'level': e['level'],
        }
        for i, e in enumerate(entries)
    ]
}

out_path = os.path.join(BASE, 'data', 'toeic.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f'\n✅ toeic.json saved ({total} words) → {out_path}')
