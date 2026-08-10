#!/usr/bin/env python3
"""Build compact map data from the ARK Starmap bootup dump + lore annotations."""
import json, re
from pathlib import Path

HERE = Path(__file__).parent
d = json.load(open(HERE / 'starcitizen_map.json', encoding='utf-8'))['data']
systems = d['systems']['resultset']
tunnels = d['tunnels']['resultset']

# --- Lore updates since the 2015 dump (verified on starcitizen.tools, Aug 2026) ---
RENAMES = {  # human name -> current official Xi'an name
    'Kayfa': "Kai'pua",
    'Hadur': "Yā'mon",
    'Pallas': "Th.us'ūng",
    'Indra': "Kyuk'ya",
    'Virtus': "La'uo",
    'Eealus': "Ē'aluth",
    'Tal': 'T.āl',
    "Ayr'ka": "Ail'ka",
    'Rihlah': "R.il'a",
    'Khabari': "K.ap'a'ri",
    'Markahil': 'Malkail',
}
SPELLFIX = {'Vermillion': 'Vermilion'}  # current official spelling, no "formerly" flag
# Only Vulture's VS designation is published; the rest are UEE-classified
VS_KNOWN = {'Vulture': 'VS-9 "Vulture"'}
LOST = {  # UEE systems conquered by the Vanduul
    'Orion':  {'fell': 2712, 'note': 'Site of first contact with the Vanduul (Armitage, 2681). Fell after a Kingship arrived in 2712.'},
    'Tiber':  {'fell': 2736, 'note': 'The "Meatgrinder" — fortified frontline that ground down fleets for decades before falling in 2736.'},
    'Virgil': {'fell': 2736, 'note': 'Project Far Star colony; the UEE defense collapsed here after Tiber fell.'},
    'Caliban':{'fell': 2884, 'note': 'Fell in 2884 after years of underfunded defense — last Kingship incursion into UEE space until Vega.'},
}
CLASHES = {  # battle markers
    'Orion':   {'year': '2681', 'battle': 'First Contact — Vanduul raid on Dell Township, Armitage'},
    'Tiber':   {'year': '2712–2736', 'battle': 'Siege of Tiber — decades-long frontline meatgrinder'},
    'Virgil':  {'year': '2736', 'battle': 'Fall of Virgil — failed UEE last stand'},
    'Caliban': {'year': '2884', 'battle': 'Fall of Caliban — Lost Squad’s last stand'},
    'Vega':    {'year': '2945', 'battle': 'Battle of Vega II — Vanduul assault on New Corvo; triggered formal declaration of war'},
    'Elysium': {'year': '2603–2610', 'battle': 'Second Tevarin War — Corath’Thal’s fleet crashed into Elysium IV'},
}
CONTESTED = {
    'Oya':   'Shared sovereignty: Oya III hosts the only sovereign Xi’an territory inside the Empire — a returned Xi’an settlement.',
    'Tohil': 'Frontier buffer between UEE, Xi’an and unclaimed space; haven for smugglers circumventing both authorities.',
    'Vega':  'UEE frontline system against the Vanduul; attacked in 2945.',
}
# Fair Chance Act: developing-world protection. The six 'DEV' systems plus Cano
# and Tamsa (UEE-affiliated on the starmap but FCA-protected in lore).
FCA_PROTECTED = ['Oso', 'Garron', 'Genesis', 'Kellog', 'Kallis', 'Osiris', 'Cano', 'Tamsa']
FCA_CANDIDATE = ['Gurzil', 'Min']  # proposed/debated protection, not enacted
# NOTE: the Banu system Ophos is NOT on the ARK Starmap — verified against the live
# starmap API (robertsspaceindustries.com/api/starmap/bootup, Aug 2026: 90 systems,
# no Ophos entry). It has no published coordinates or jump tunnels, so it cannot be
# placed on this map. Revisit if CIG ever charts it.
PERRY_UEE  = ['Gurzil', 'Horus', 'Oya', 'Tohil']
PERRY_XIAN = ["Yā'mon", "Th.us'ūng", "Kyuk'ya", "La'uo"]
# Tiered capital taxonomy: ★ political capital, ◆ de facto hub, ⌂ homeworld,
# ◈ gateway, ✦ council seat. The Vanduul have no capital — the clans are nomadic.
CAPITALS = {
    'Sol':     {'glyphs': '★⌂', 'note': "Political capital of the UEE — the Senate sits in New York, Earth. Humanity's homeworld."},
    'Terra':   {'glyphs': '◆',  'note': "De facto economic and cultural hub. Not the official capital — Terra's rivalry with Earth for primacy is a defining tension of UEE politics."},
    'Bacchus': {'glyphs': '◆⌂', 'note': "Center of Banu trade and culture. Believed to be the Banu homeworld — even the Banu aren't certain; records were never kept."},
    'Trise':   {'glyphs': '✦',  'note': 'Seat of the Banu Council, whose dictums define Banu society. The Protectorate has no formal capital; the Council governs from deliberate isolation.'},
    "R.il'a":  {'glyphs': '◈',  'note': "Gateway system: the principal Xi'an system open to human travel and trade. Not the capital — that is Hyoton, uncharted by human cartographers."},
    'Elysium': {'glyphs': '⌂',  'note': 'Homeworld of the Tevarin, conquered and absorbed by the UEE after the two Tevarin Wars.'},
}
# Oretani: cut off from the Empire when its only jump point (from Ferron) collapsed.
ISOLATED = {
    'Oretani': {'year': 2485, 'via': 'Ferron',
                'note': 'Jump point from Ferron collapsed in 2485 — no contact since. The last recorded population figure predates the collapse and is unverifiable.'},
}

def clean(txt):
    if not txt: return ''
    return re.sub(r'\s+', ' ', txt).strip()

out_systems = []
for s in systems:
    name = RENAMES.get(s['name'], SPELLFIX.get(s['name'], s['name']))
    aff = s['affiliation'][0]['code'].upper() if s['affiliation'] else 'UNC'
    rec = {
        'id': s['id'], 'name': name,
        'x': round(float(s['position_x']), 2),
        'y': round(-float(s['position_y']), 2),  # flip for screen coords
        'aff': aff,
        'size': float(s['aggregated_size'] or 0),
        'pop': float(s['aggregated_population'] or 0),
        'econ': float(s['aggregated_economy'] or 0),
        'danger': float(s['aggregated_danger'] or 0),
        'desc': clean(s['description']),
        'type': s['type'],
    }
    if s['name'] in RENAMES: rec['formerName'] = s['name']
    if name in LOST: rec['lost'] = LOST[name]
    if name in CLASHES: rec['clash'] = CLASHES[name]
    if name in CONTESTED: rec['contested'] = CONTESTED[name]
    if name in PERRY_UEE: rec['perry'] = 'UEE'
    if name in PERRY_XIAN: rec['perry'] = 'XIAN'
    if name in CAPITALS: rec['capital'] = CAPITALS[name]
    if name in ISOLATED: rec['isolated'] = ISOLATED[name]
    if name in FCA_PROTECTED: rec['fca'] = 1
    if name in FCA_CANDIDATE: rec['fcaCand'] = 1
    if aff == 'VNCL':
        rec['vs'] = VS_KNOWN.get(name, 'VS-series · classified')
    out_systems.append(rec)

out_tunnels = []
seen = set()
for t in tunnels:
    a, b = t['entry']['star_system_id'], t['exit']['star_system_id']
    key = tuple(sorted((a, b)))
    if key in seen: continue
    seen.add(key)
    out_tunnels.append({'a': a, 'b': b, 'size': t['size']})

# --- Part B of SYSTEM_VIEW_HANDOFF.md -> per-system bodies -------------------
TYPE_MAP = {'STAR': 'star', 'BLACKHOLE': 'bh', 'PLANET': 'planet', 'SATELLITE': 'moon',
            'ASTEROID_BELT': 'belt', 'ASTEROID_FIELD': 'field', 'MANMADE': 'station',
            'JUMPPOINT': 'jump', 'POI': 'poi'}
ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV']

def strip_paren(s):
    return re.sub(r'\s*\([^)]*\)', '', s).strip()

def parse_part_b(path):
    import sys
    lines = open(path, encoding='utf-8').read().splitlines()
    try:
        start = next(i for i, l in enumerate(lines) if l.startswith('## PART B'))
    except StopIteration:
        sys.exit('Part B not found in ' + str(path))
    bodies_by_system, star_only, cur, cur_name = {}, [], None, None
    total = 0
    for ln in lines[start:]:
        line = ln.strip()
        if not line or line.startswith('NOTE') or line.startswith('Format:') or line.startswith('Data source') or line == '---':
            continue
        if line.startswith('### '):
            head = line[4:]
            if head.startswith('Star-only systems'):
                cur, cur_name = star_only, None
                continue
            parts = [p.strip() for p in head.split('|')]
            if len(parts) != 3:
                sys.exit('Malformed section header: ' + line)
            disp = strip_paren(re.sub(r'\s*\(formerly[^)]*\)', '', parts[1]))
            m = re.match(r'VS-\d+\s+"(.+)"', disp)
            if m: disp = m.group(1)
            cur_name = disp
            cur = bodies_by_system.setdefault(disp, [])
            continue
        if cur is star_only:
            m = re.match(r'^([A-Z\'ĀĒ.]+)\s*\|\s*(.+?)\s+—\s+star only', line)
            if not m:
                sys.exit('Malformed star-only row: ' + line)
            star_only.append(strip_paren(m.group(2)))
            continue
        if cur is None:
            continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) != 6 or parts[0] not in TYPE_MAP or parts[5] not in ('H', 'N'):
            sys.exit('Malformed body row in ' + str(cur_name) + ': ' + line)
        t, desig, name, parent, subtype, hab = parts
        desig, parent = strip_paren(desig), strip_paren(parent)
        if parent == '-' and TYPE_MAP[t] == 'moon':
            # resolve satellite parent from designation prefix: "Sol 3a" -> "Sol III"
            pm = re.match(r'^(.*)\s+(\d+)[a-z]$', desig)
            if pm and int(pm.group(2)) < len(ROMAN):
                parent = pm.group(1) + ' ' + ROMAN[int(pm.group(2))]
        rec = {'t': TYPE_MAP[t], 'd': desig}
        if name != '-': rec['n'] = name
        if parent != '-': rec['p'] = parent
        if subtype != '-': rec['st'] = subtype
        if hab == 'H': rec['h'] = 1
        cur.append(rec)
        total += 1
    for nm in star_only:
        if nm in bodies_by_system:
            sys.exit('Star-only duplicate section: ' + nm)
        bodies_by_system[nm] = [{'t': 'star', 'd': nm}]
        total += 1
    return bodies_by_system, star_only, total

bodies_by_system, star_only_names, body_total = parse_part_b(HERE / 'SYSTEM_VIEW_HANDOFF.md')
matched = 0
for rec in out_systems:
    if rec['name'] in bodies_by_system:
        rec['bodies'] = bodies_by_system.pop(rec['name'])
        nonjump = [b for b in rec['bodies'] if b['t'] not in ('jump', 'poi')]
        if len(nonjump) == 1 and nonjump[0]['t'] == 'star':
            rec['noScan'] = 1
        matched += 1
import sys as _sys
if bodies_by_system:
    _sys.exit('Part B sections with no matching system: ' + ', '.join(bodies_by_system))
if matched != len(out_systems):
    _sys.exit(f'Only {matched}/{len(out_systems)} systems have bodies')
print(f'bodies: {body_total} objects across {matched} systems '
      f'({matched - len(star_only_names)} full + {len(star_only_names)} star-only)')

AFFS = {
    'UEE':  {'name': 'United Empire of Earth', 'color': '#48bbd4'},
    'BANU': {'name': 'Banu Protectorate',      'color': '#ffce17'},
    'VNCL': {'name': 'Vanduul Clans',          'color': '#c8324f'},
    'XIAN': {'name': "Xi'an Empire (SaoXy'an)", 'color': '#52c231'},
    'DEV':  {'name': 'Fair Chance Act (FCA)',  'color': '#9b7bff'},
    'UNC':  {'name': 'Unclaimed',              'color': '#8a7f6d'},
}

data = {'systems': out_systems, 'tunnels': out_tunnels, 'affs': AFFS}
json.dump(data, open(HERE / 'scdata.json', 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, separators=(',', ':'))

# merge data + territory engine into the template to produce the publishable page
template = open(HERE / 'template.html', encoding='utf-8').read()
scdata = open(HERE / 'scdata.json', encoding='utf-8').read()
engine = open(HERE / 'territory.js', encoding='utf-8').read()
page = template.replace('/*__ENGINE__*/', engine).replace('__DATA__', scdata)
open(HERE.parent / 'index.html', 'w', encoding='utf-8', newline='\n').write(page)

print('systems:', len(out_systems), 'unique tunnels:', len(out_tunnels))
print('bytes:', len(scdata))

# territory engine tests gate the build
import subprocess, sys
t = subprocess.run(['node', str(HERE / 'test_territory.js')], capture_output=True,
                   text=True, encoding='utf-8', errors='replace')
out = (t.stdout or '') + (t.stderr or '')
try: print(out.strip())
except UnicodeEncodeError: print(out.strip().encode('ascii', 'replace').decode())
if t.returncode:
    sys.exit('territory tests FAILED — build aborted')
