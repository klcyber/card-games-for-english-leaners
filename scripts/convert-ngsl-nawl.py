#!/usr/bin/env python3
# Convert NGSL.csv → daily.json, NAWL.csv → toefl.json
import csv, json, os, re

BASE = os.path.join(os.path.dirname(__file__), '..')

def clean(s):
    return re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip()

# ── Parse NAWL.csv ────────────────────────────────────────────────────────────
# Columns: Rank, Lemma, POS, Definition, JP Translation
nawl_words = []
nawl_seen  = set()
with open(os.path.join(BASE, 'NAWL.csv'), encoding='utf-8-sig') as f:
    for row in csv.reader(f):
        if not row or row[0].strip() == 'Rank':
            continue
        rank = int(row[0]) if row[0].isdigit() else 9999
        word = clean(row[1]) if len(row) > 1 else ''
        defn = clean(row[3]) if len(row) > 3 else ''
        jp   = clean(row[4]) if len(row) > 4 else ''
        if not word or word.lower() in nawl_seen:
            continue
        nawl_seen.add(word.lower())
        nawl_words.append({'word': word, 'rank': rank, 'definition': defn, 'translation': jp})

nawl_words.sort(key=lambda w: w['rank'])

total  = len(nawl_words)
third  = total // 3
for i, w in enumerate(nawl_words):
    w['level'] = 1 if i < third else (2 if i < third * 2 else 3)

# Build rank map for NGSL cross-reference
rank_map = {w['word'].lower(): w['rank'] for w in nawl_words}

l1 = sum(1 for w in nawl_words if w['level'] == 1)
l2 = sum(1 for w in nawl_words if w['level'] == 2)
l3 = sum(1 for w in nawl_words if w['level'] == 3)
print(f'NAWL: {total} words | ★={l1} ★★={l2} ★★★={l3}')
print(f'  L1 sample: {[w["word"] for w in nawl_words if w["level"]==1][:6]}')
print(f'  L2 sample: {[w["word"] for w in nawl_words if w["level"]==2][:6]}')
print(f'  L3 sample: {[w["word"] for w in nawl_words if w["level"]==3][:6]}')
print(f'  no def: {sum(1 for w in nawl_words if not w["definition"])}')
print(f'  no JP:  {sum(1 for w in nawl_words if not w["translation"])}')

toefl_out = {
    'category': 'toefl',
    'source': 'NAWL with Japanese translations',
    'words': [
        {
            'id': f'f{i+1:04d}',
            'word': w['word'],
            'translation': w['translation'],
            'definition': w['definition'],
            'level': w['level'],
        }
        for i, w in enumerate(nawl_words)
    ]
}
with open(os.path.join(BASE, 'data', 'toefl.json'), 'w', encoding='utf-8') as f:
    json.dump(toefl_out, f, ensure_ascii=False, indent=2)
print(f'\n✅ toefl.json saved ({total} words)')

# ── Parse NGSL.csv ────────────────────────────────────────────────────────────
# Columns: Meanings (word), English Definition, POS, J Translation
ngsl_words = []
ngsl_seen  = set()
with open(os.path.join(BASE, 'NGSL.csv'), encoding='utf-8-sig') as f:
    for row in csv.reader(f):
        if not row or row[0].strip() in ('Meanings', ''):
            continue
        word = clean(row[0]) if len(row) > 0 else ''
        defn = clean(row[1]) if len(row) > 1 else ''
        jp   = clean(row[3]) if len(row) > 3 else ''
        if not word or not re.search(r'[a-zA-Z]', word):
            continue
        if word.lower() in ngsl_seen:
            continue
        ngsl_seen.add(word.lower())

        # Level via NAWL rank cross-reference
        r = rank_map.get(word.lower())
        if r is not None:
            level = 1 if r <= third else (2 if r <= third * 2 else 3)
        else:
            level = 3

        ngsl_words.append({'word': word, 'definition': defn, 'translation': jp, 'level': level})

# Sort: level asc, then alphabetically within level
ngsl_words.sort(key=lambda w: (w['level'], w['word'].lower()))

g_total = len(ngsl_words)
g1 = sum(1 for w in ngsl_words if w['level'] == 1)
g2 = sum(1 for w in ngsl_words if w['level'] == 2)
g3 = sum(1 for w in ngsl_words if w['level'] == 3)
print(f'\nNGSL: {g_total} words | ★={g1} ★★={g2} ★★★={g3}')
print(f'  L1 sample: {[w["word"] for w in ngsl_words if w["level"]==1][:8]}')
print(f'  L2 sample: {[w["word"] for w in ngsl_words if w["level"]==2][:8]}')
print(f'  L3 sample: {[w["word"] for w in ngsl_words if w["level"]==3][:8]}')
print(f'  no def: {sum(1 for w in ngsl_words if not w["definition"])}')
print(f'  no JP:  {sum(1 for w in ngsl_words if not w["translation"])}')

daily_out = {
    'category': 'daily',
    'source': 'NGSL (New General Service List) with Japanese translations',
    'words': [
        {
            'id': f'd{i+1:04d}',
            'word': w['word'],
            'translation': w['translation'],
            'definition': w['definition'],
            'level': w['level'],
        }
        for i, w in enumerate(ngsl_words)
    ]
}
with open(os.path.join(BASE, 'data', 'daily.json'), 'w', encoding='utf-8') as f:
    json.dump(daily_out, f, ensure_ascii=False, indent=2)
print(f'\n✅ daily.json saved ({g_total} words)')
print('\n=== DONE ===')
