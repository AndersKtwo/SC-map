# SYSTEM VIEW — Handoff for Claude Code

Feature: clicking any system on The Verse map opens a **system view** — an orbital diagram of everything inside that system (star(s), planets, moons, stations, asteroid belts, jump points), in the same Stellaris-style aesthetic as the galaxy view. This document contains the complete UI spec (Part A) and the complete researched inventory of all 90 systems (Part B), collected Aug 2026 from the Star Citizen Wiki API (api.star-citizen.wiki, which mirrors RSI's ARK Starmap data — current, includes e.g. the Stanton–Nyx placeholder jump).

---

## PART A — SPEC

### A1. Interaction model
- Click a system node (galaxy view) → system view opens as a full-canvas takeover with a breadcrumb top-left: `THE VERSE ▸ Stanton`. Clicking `THE VERSE` or pressing ESC returns to the galaxy, camera restored. Detail card behavior on the galaxy stays as-is; add an "Open system ▸" button to the detail card as the second entry point (direct click = primary).
- Inside the system view: hover any object → tooltip (name, designation, subtype, habitable flag, parent). Click a jump point → travel: opens the destination system's view (breadcrumb grows, back returns one step). This makes the map navigable Elite/ARK-style without returning to the galaxy.
- Route planner integration: if a route is active on the galaxy map, the system view highlights the entry and exit jump points of that system's leg in the route's gold.

### A2. Layout algorithm (schematic, not to scale)
- Star(s) at center. BINARY systems: two stars offset horizontally; a star whose parent is the other star (e.g. Tyrol B, Kyuk'ya B) renders as a small companion on a tight orbit ring around the primary.
- One orbit ring per top-level object (planets, system-level belts/clusters), ordered by roman-numeral designation (I, II, III…); objects lacking numerals (e.g. Delamar, Min's rogue planet) keep their data order. Rings are evenly spaced — schematic like the ARK Starmap, not physical distances.
- Moons (SATELLITE): small nodes clustered on a mini-orbit around their parent planet. Stations (MANMADE): small diamond markers offset near their parent (or near the star if parentless). Planetary rings (ASTEROID_BELT with a planet parent): thin ellipse drawn around that planet. System belts/clusters: dashed/stippled full-circumference ring at their designation position.
- JUMPPOINT objects: on an outermost rim ring. **Place each jump point at the bearing of its destination system on the galaxy map** (compute from galaxy x/y of the two systems) — so Stanton's Pyro jump sits in the direction Pyro actually lies. Label `→ Pyro [M]` with the tunnel size from the existing tunnels data; non-canon game jumps (Stanton–Nyx) only appear in Live mode styling (hazard orange) consistent with the mode rules.
- Habitable objects get a soft green-white glow; named objects show `Name` big + designation small; unnamed show designation only.

### A3. Visual language (reuse, don't invent)
Same palette, starfield, and typography as the galaxy view. Subtype → color/size hints: Gas Giant/Super Jupiter large + banded warm tint; Ice Giant/Ice Planet pale blue; Terrestrial Rocky/Super-Earth neutral rock; Ocean Planet deep blue; Lava/Chthonian ember; Smog/Desert dusty; Protoplanet/Dwarf small + dim; Artificial (Chronos III Synthworld!) distinct construct styling; BLACKHOLE (Tamsa!) accretion-disk render; Neutron (Banshee) tiny brilliant white; star classes tint by letter (O/B blue, A white, F/G yellow, K orange, M red, White Dwarf pale, Giant large).
Special states: systems whose inventory is star-only (all VS-designation Vanduul systems, K.ap'a'ri, Malkail, Vagabond…) render the lone star plus a scanline overlay reading `NO SCAN DATA — UEE SURVEY CLASSIFIED OR UNAVAILABLE` — a feature, not a gap. Oretani's view shows its severed Ferron jump point in the broken style with the 2485 note. Vega's POI (VANDUUL-WARN-01 on Aremis) renders as a red ⚠ marker.

### A4. Data pipeline
- Part B below is the dataset. Parse it in build_data.py (format is strictly line-based: `TYPE | designation | name | parent | subtype | habitable`), normalize, and embed as a `bodies` field per system in scdata.json. Everything stays in the single self-contained index.html; estimated added weight ~120–180 KB — acceptable, no lazy loading needed.
- Normalization rules: strip parenthetical old names from designations/parents (`Yā'mon (Hadur) II` → `Yā'mon II`); parent `-` on a SATELLITE/ring means resolve by designation prefix (e.g. `Sol 3a` → parent `Sol III`); `H`=habitable true. Keep RSI's data quirks (Pyro IV orbiting Pyro V; Ellis XI appearing as both planet and cluster — keep the planet, keep the cluster as belt; Gurzil's nine protoplanetary disks may be drawn as one labeled multi-ring band).
- Known data corrections surfaced during research, apply to the MAIN map too: current spelling is **Vermilion** (one L); additional current Xi'an renames: **Rihlah → R.il'a**, **Khabari → K.ap'a'ri**, **Markahil → Malkail**; Vanduul-held systems carry official VS designations (e.g. `VS-9 "Vulture"`) — show as subtitle on their tooltips.
- Optional enrichment (later, not this goal): per-object descriptions exist at `GET api.star-citizen.wiki/api/v2/starsystems/{CODE}?include=celestialObjects` — a fetch script could add a `desc` per body.

### A5. Suggested /goal
```
/goal System view feature complete: clicking any galaxy system opens an orbital system view per SYSTEM_VIEW_HANDOFF.md Part A, with data parsed from Part B into scdata.json via build_data.py; all 90 systems open without errors (headless script iterates every system, zero page exceptions); jump points positioned by real galaxy bearing and clickable to navigate between system views; breadcrumb + ESC return to galaxy with camera restored; star-only systems show the NO SCAN DATA state; Tamsa renders a black hole, Chronos III renders as Artificial; screenshots of Stanton, Sol, Tamsa, and one NO-SCAN Vanduul system saved to screenshots/ and reviewed; Live game mode unaffected except system views for Stanton/Pyro/Nyx show the placeholder jump in hazard orange; README updated; committed, clean git status. Or stop after 30 turns.
```

---

## PART B — COMPLETE SYSTEM INVENTORY (90 systems)

Format: `TYPE | designation | name | parent | subtype | habitable(H/N)`. `-` = none/unknown. Header line: `code | current display name | system type`.

### SOL | Sol | SINGLE_STAR
STAR | Sol | - | - | Main Sequence-Dwarf-G | N
PLANET | Sol I | Mercury | - | Iron Planet | N
PLANET | Sol II | Venus | - | Smog Planet | N
PLANET | Sol III | Earth | - | Terrestrial Rocky | H
PLANET | Sol IV | Mars | - | Desert Planet | H
PLANET | Sol V | Jupiter | - | Gas Giant | N
PLANET | Sol VI | Saturn | - | Gas Giant | N
PLANET | Sol VII | Uranus | - | Ice Giant | N
PLANET | Sol VIII | Neptune | - | Ice Giant | N
PLANET | Sol IX | Pluto | - | Dwarf Planet | N
SATELLITE | Sol 3a | Luna | Earth | Planetary Moon | N
SATELLITE | Sol 4a | Phobos | Mars | Planetary Moon | N
SATELLITE | Sol 4b | Deimos | Mars | Planetary Moon | N
SATELLITE | Sol 5a | Io | Jupiter | Planetary Moon | N
SATELLITE | Sol 5b | Europa | Jupiter | Planetary Moon | N
SATELLITE | Sol 5c | Ganymede | Jupiter | Planetary Moon | N
SATELLITE | Sol 5d | Callisto | Jupiter | Planetary Moon | N
SATELLITE | Sol 6a | Titan | Saturn | Planetary Moon | N
SATELLITE | Sol 6b | Rhea | Saturn | Planetary Moon | N
SATELLITE | Sol 6c | Tethys | Saturn | Planetary Moon | N
SATELLITE | Sol 6d | Dione | Saturn | Planetary Moon | N
SATELLITE | Sol 6e | Iapetus | Saturn | Planetary Moon | N
SATELLITE | Sol 7a | Miranda | Uranus | Planetary Moon | N
SATELLITE | Sol 7b | Ariel | Uranus | Planetary Moon | N
SATELLITE | Sol 7c | Umbriel | Uranus | Planetary Moon | N
SATELLITE | Sol 7d | Titania | Uranus | Planetary Moon | N
SATELLITE | Sol 7e | Oberon | Uranus | Planetary Moon | N
SATELLITE | Sol 8a | Triton | Neptune | Planetary Moon | N
SATELLITE | Sol 9a | Charon | Pluto | Planetary Moon | N
ASTEROID_BELT | Sol Belt Alpha | Herschel Belt | - | System Belt | N
ASTEROID_BELT | Sol Belt Beta | Kuiper Belt | - | System Belt | N
ASTEROID_BELT | Rings of Saturn | - | Saturn | Planetary Ring | N
ASTEROID_BELT | Jovian Rings | - | Jupiter | Planetary Ring | N
ASTEROID_BELT | Rings of Neptune | - | Neptune | Planetary Ring | N
ASTEROID_BELT | Rings of Uranus | - | Uranus | Planetary Ring | N
MANMADE | TDD Kesner | - | - | Space Station | H
MANMADE | IMS Bolliver | - | Ganymede | Space Station | H
MANMADE | INS Dunleavy | - | - | Space Station | H
JUMPPOINT | Sol - Davien | - | - | - | N
JUMPPOINT | Sol - Croshaw | - | - | - | N

### STANTON | Stanton | SINGLE_STAR
STAR | Stanton | - | - | Main Sequence-Dwarf-G | N
PLANET | Stanton I | Hurston | - | Super-Earth | H
PLANET | Stanton II | Crusader | - | Gas Giant | H
PLANET | Stanton III | ArcCorp | - | Super-Earth | H
PLANET | Stanton IV | microTech | - | Super-Earth | H
SATELLITE | Stanton 1a | Arial | Hurston | Planetary Moon | N
SATELLITE | Stanton 1b | Aberdeen | Hurston | Planetary Moon | N
SATELLITE | Stanton 1c | Magda | Hurston | Planetary Moon | N
SATELLITE | Stanton 1d | Ita | Hurston | Planetary Moon | N
SATELLITE | Stanton 2a | Cellin | Crusader | Planetary Moon | N
SATELLITE | Stanton 2b | Daymar | Crusader | Planetary Moon | N
SATELLITE | Stanton 2c | Yela | Crusader | Planetary Moon | N
SATELLITE | Stanton 3a | Lyria | ArcCorp | Planetary Moon | N
SATELLITE | Stanton 3b | Wala | ArcCorp | Planetary Moon | N
SATELLITE | Stanton 4a | Calliope | microTech | Planetary Moon | N
SATELLITE | Stanton 4b | Clio | microTech | Planetary Moon | N
SATELLITE | Stanton 4c | Euterpe | microTech | Planetary Moon | N
ASTEROID_BELT | Stanton Belt Alpha | Aaron Halo | - | System Belt | N
ASTEROID_BELT | Ring of Yela | - | Yela | Planetary Ring | N
MANMADE | Port Olisar | - | Crusader | Starbase | H
MANMADE | Security Post Kareah | - | Crusader | Orbital Defense | H
MANMADE | Covalex Hub Gundo | - | Crusader | Space Station | N
MANMADE | CommArray SCC | - | Crusader | Space Station | N
MANMADE | Cry-Astro Service | - | Crusader | Space Station | N
MANMADE | ICC ScanHub Stanton | - | Crusader | Probe | H
JUMPPOINT | Stanton - Magnus | - | - | - | N
JUMPPOINT | Stanton - Pyro | - | - | - | N
JUMPPOINT | Stanton - Terra | - | - | - | N
JUMPPOINT | Stanton - Nyx | - | - | - | N

### TERRA | Terra | SINGLE_STAR
STAR | Terra | Terra Nova | - | Main Sequence-Dwarf-G | N
PLANET | Terra I | Aero | - | Mesoplanet | N
PLANET | Terra II | Pike | - | Terrestrial Rocky | H
PLANET | Terra III | Terra | - | Super-Earth | H
PLANET | Terra IV | Gen | - | Super-Earth | H
SATELLITE | Terra 1a | Petram | Aero | Planetary Moon | N
SATELLITE | Terra 1b | Petrus | Aero | Planetary Moon | N
SATELLITE | Terra 2a | Toja | Pike | Planetary Moon | N
SATELLITE | Terra 3a | Eda | Terra | Planetary Moon | N
ASTEROID_BELT | Terra Belt Beta | Marisol Belt | - | System Belt | N
ASTEROID_FIELD | Terra Cluster Alpha | Henge Cluster | - | System Cluster | N
MANMADE | INS Reilly | - | Terra 1a | Space Station | H
MANMADE | IAS Hammett | - | Terra | Space Station | H
MANMADE | ICS Evolen | - | Terra | Space Station | H
JUMPPOINT | Terra - Hadrian | - | - | - | N
JUMPPOINT | Terra - Tayac | - | - | - | N
JUMPPOINT | Terra - Magnus | - | - | - | N
JUMPPOINT | Terra - Pyro | - | - | - | N
JUMPPOINT | Terra - Stanton | - | - | - | N
JUMPPOINT | Terra - Taranis | - | - | - | N
JUMPPOINT | Terra - Goss | - | - | - | N

### CROSHAW | Croshaw | SINGLE_STAR
STAR | Croshaw | - | - | Main Sequence-Dwarf-G | N
PLANET | Croshaw I | - | - | Smog Planet | N
PLANET | Croshaw II | Angeli | - | Terrestrial Rocky | H
PLANET | Croshaw III | Vann | - | Ice Planet | H
PLANET | Croshaw IV | - | - | Super-Earth | N
ASTEROID_FIELD | Croshaw Cluster Alpha | Icarus Cluster | - | System Cluster | N
ASTEROID_FIELD | Croshaw Cluster Beta | Daedalus Cluster | - | System Cluster | N
JUMPPOINT | Croshaw - Sol | - | - | - | N
JUMPPOINT | Croshaw - Ferron | - | - | - | N
JUMPPOINT | Croshaw - Rhetor | - | - | - | N
JUMPPOINT | Croshaw - Nul | - | - | - | N

### PYRO | Pyro | SINGLE_STAR
STAR | Pyro | - | - | Main Sequence-Dwarf-K | N
PLANET | Pyro I | - | - | Terrestrial Rocky | N
PLANET | Pyro II | Monox | - | Terrestrial Rocky | N
PLANET | Pyro III | Bloom | - | Terrestrial Rocky | H
PLANET | Pyro IV | - | Pyro V | Terrestrial Rocky | N
PLANET | Pyro V | - | - | Gas Giant | N
PLANET | Pyro VI | Terminus | - | Terrestrial Rocky | H
SATELLITE | Pyro 5a | Ignis | Pyro IV | Planetary Moon | N
SATELLITE | Pyro 5b | Vatra | Pyro IV | Planetary Moon | N
SATELLITE | Pyro 5c | Adir | Pyro IV | Planetary Moon | N
SATELLITE | Pyro 5d | Fairo | Pyro IV | Planetary Moon | N
SATELLITE | Pyro 5e | Fuego | Pyro IV | Planetary Moon | N
SATELLITE | Pyro 5f | Vuur | Pyro IV | Planetary Moon | N
ASTEROID_FIELD | Pyro Cluster Alpha | Akiro Cluster | - | System Cluster | N
MANMADE | Ruin Station | - | Pyro VI | Space Station | H
MANMADE | PYAM-FARSTAT-2-4 | Checkmate Station | Monox | Space Station | H
JUMPPOINT | Pyro - Stanton | - | - | - | N
JUMPPOINT | Pyro - Hadrian | - | - | - | N
JUMPPOINT | Pyro - Oso | - | - | - | N
JUMPPOINT | Pyro - Castra | - | - | - | N
JUMPPOINT | Pyro - Terra | - | - | - | N
JUMPPOINT | Pyro - Cano | - | - | - | N
JUMPPOINT | Pyro - Nyx | - | - | - | N

### NYX | Nyx | SINGLE_STAR
STAR | Nyx | - | - | Main Sequence-Dwarf-F | N
PLANET | Nyx I | - | - | Terrestrial Rocky | N
PLANET | Nyx II | - | - | Smog Planet | N
PLANET | Nyx III | - | - | Ice Giant | N
PLANET | Delamar | - | - | Protoplanet | N
ASTEROID_BELT | Nyx Belt Alpha | Glaciem Ring | - | System Belt | N
ASTEROID_BELT | Nyx Belt Beta | Keeger Belt | - | System Belt | N
JUMPPOINT | Nyx - Castra | - | - | - | N
JUMPPOINT | Nyx - Bremen | - | - | - | N
JUMPPOINT | Nyx - Pyro | - | - | - | N
JUMPPOINT | Nyx - Virgil | - | - | - | N
JUMPPOINT | Nyx - Odin | - | - | - | N
JUMPPOINT | Nyx - Stanton | - | - | - | N
JUMPPOINT | Nyx - Tohil | - | - | - | N

### MAGNUS | Magnus | SINGLE_STAR
STAR | Magnus | - | - | Main Sequence-Dwarf-K | N
PLANET | Magnus I | - | - | Chthonian Planet | N
PLANET | Magnus II | Borea | - | Terrestrial Rocky | H
PLANET | Magnus III | - | - | Super Jupiter | N
JUMPPOINT | Magnus - Ellis | - | - | - | N
JUMPPOINT | Magnus - Terra | - | - | - | N
JUMPPOINT | Magnus - Stanton | - | - | - | N

### BACCHUS | Bacchus | BINARY
STAR | Bacchus A | - | - | Main Sequence-Dwarf-G | N
STAR | Bacchus B | - | - | Main Sequence-Dwarf-K | N
PLANET | Bacchus I | - | - | Smog Planet | N
PLANET | Bacchus II | - | - | Ocean Planet | H
PLANET | Bacchus III | - | - | Gas Giant | N
ASTEROID_BELT | Bacchus Belt Alpha | - | - | System Belt | N
MANMADE | Bacchus Flotilla | - | - | Space Station | H
JUMPPOINT | Bacchus - Garron | - | - | - | N
JUMPPOINT | Bacchus - Geddon | - | - | - | N
JUMPPOINT | Bacchus - Davien | - | - | - | N

### BAKER | Baker | BINARY
STAR | Baker A | - | - | Main Sequence-Dwarf-K | N
STAR | Baker B | - | - | Main Sequence-Dwarf-K | N
PLANET | Baker I | - | - | Iron Planet | N
PLANET | Baker II | - | - | Smog Planet | N
PLANET | Baker III | - | - | Ice Giant | N
PLANET | Baker IV | - | - | Terrestrial Rocky | H
MANMADE | Covalex Shipping Hub Xenia | - | - | Space Station | H
JUMPPOINT | Baker - Yā'mon | - | - | - | N
JUMPPOINT | Baker - Tayac | - | - | - | N
JUMPPOINT | Baker - Kiel | - | - | - | N
JUMPPOINT | Baker - Osiris | - | - | - | N
JUMPPOINT | Baker - Th.us'ūng | - | - | - | N

### BANSHEE | Banshee | SINGLE_STAR
STAR | Banshee | - | - | Neutron | N
PLANET | Banshee I | - | - | Dwarf Planet | N
PLANET | Banshee II | - | - | Iron Planet | N
PLANET | Banshee III | Lorona | - | Terrestrial Rocky | H
PLANET | Banshee IV | - | - | Ice Giant | N
JUMPPOINT | Banshee - Fora | - | - | - | N
JUMPPOINT | Banshee - Yulin | - | - | - | N
JUMPPOINT | Banshee - Leir | - | - | - | N
JUMPPOINT | Banshee - Garron | - | - | - | N
JUMPPOINT | Banshee - Tamsa | - | - | - | N

### BRANAUGH | Branaugh | SINGLE_STAR
STAR | Branaugh | - | - | Main Sequence-Dwarf-K | N
PLANET | Branaugh I | - | - | Terrestrial Rocky | N
PLANET | Branaugh II | - | - | Terrestrial Rocky | H
PLANET | Branaugh III | - | - | Gas Giant | N
ASTEROID_BELT | Branaugh Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Rings of Branaugh II | - | Branaugh II | Planetary Ring | N
JUMPPOINT | Branaugh - Chronos | - | - | - | N

### BREMEN | Bremen | SINGLE_STAR
STAR | Bremen | - | - | Main Sequence-Dwarf-K | N
PLANET | Bremen I | - | - | Protoplanet | N
PLANET | Bremen II | Rytif | - | Terrestrial Rocky | H
PLANET | Bremen III | - | - | Coreless Planet | N
PLANET | Bremen IV | - | - | Ice Giant | N
JUMPPOINT | Bremen - Vega | - | - | - | N
JUMPPOINT | Bremen - Kallis | - | - | - | N
JUMPPOINT | Bremen - Nyx | - | - | - | N
JUMPPOINT | Bremen - Tanga | - | - | - | N

### CALIBAN | Caliban | SINGLE_STAR
STAR | Caliban | - | - | Main Sequence-Dwarf-G | N
PLANET | Caliban I | - | - | Terrestrial Rocky | N
PLANET | Caliban II | Crion | - | Terrestrial Rocky | H
PLANET | Caliban III | - | - | Desert Planet | N
PLANET | Caliban IV | - | - | Gas Giant | N
PLANET | Caliban V | - | - | Protoplanet | N
ASTEROID_BELT | Caliban Belt Alpha | - | - | System Belt | N
SATELLITE | Caliban 2a | - | Caliban II | Planetary Moon | N
SATELLITE | Caliban 3a | - | Caliban III | Planetary Moon | N
SATELLITE | Caliban 3b | - | Caliban III | Planetary Moon | N
SATELLITE | Caliban 4a | - | Caliban IV | Planetary Moon | N
SATELLITE | Caliban 4b | - | Caliban IV | Planetary Moon | N
SATELLITE | Caliban 4c | - | Caliban IV | Planetary Moon | N
SATELLITE | Caliban 4d | - | Caliban IV | Planetary Moon | N
SATELLITE | Caliban 4e | - | Caliban IV | Planetary Moon | N
SATELLITE | Caliban 4f | - | Caliban IV | Planetary Moon | N
JUMPPOINT | Caliban - Nul | - | - | - | N
JUMPPOINT | Caliban - Viking | - | - | - | N
JUMPPOINT | Caliban - Orion | - | - | - | N
JUMPPOINT | Caliban - Oberon | - | - | - | N

### CANO | Cano | SINGLE_STAR
STAR | Cano | - | - | Main Sequence-Dwarf-G | N
PLANET | Cano I | - | - | Mesoplanet | N
PLANET | Cano II | Carteyna | - | Ocean Planet | H
PLANET | Cano III | - | - | Smog Planet | N
PLANET | Cano IV | Pox | - | Gas Giant | N
ASTEROID_BELT | Cano Belt Alpha | - | - | System Belt | N
JUMPPOINT | Cano - Pyro | - | - | - | N
JUMPPOINT | Cano - Davien | - | - | - | N

### CASTRA | Castra | SINGLE_STAR
STAR | Castra | - | - | Main Sequence-Dwarf-B | N
PLANET | Castra I | - | - | Coreless Planet | N
PLANET | Castra II | Cascom | - | Terrestrial Rocky | H
JUMPPOINT | Castra - Pyro | - | - | - | N
JUMPPOINT | Castra - Oya | - | - | - | N
JUMPPOINT | Castra - Hadrian | - | - | - | N
JUMPPOINT | Castra - Nyx | - | - | - | N
JUMPPOINT | Castra - Oso | - | - | - | N

### CATHCART | Cathcart | SINGLE_STAR
STAR | Cathcart | - | - | Main Sequence-Dwarf-A | N
ASTEROID_BELT | Cathcart Belt Alpha | - | - | System Belt | N
MANMADE | Spider | - | - | Space Station | H
JUMPPOINT | Cathcart - Kilian | - | - | - | N
JUMPPOINT | Cathcart - Davien | - | - | - | N
JUMPPOINT | Cathcart - Hades | - | - | - | N
JUMPPOINT | Cathcart - Nexus | - | - | - | N

### CENTAURI | Centauri | SINGLE_STAR
STAR | Centauri | - | - | Main Sequence-Dwarf-A | N
PLANET | Centauri I | - | - | Protoplanet | N
PLANET | Centauri II | Yar | - | Terrestrial Rocky | H
PLANET | Centauri III | Saisei | - | Terrestrial Rocky | H
PLANET | Centauri IV | - | - | Terrestrial Rocky | N
PLANET | Centauri V | - | - | Super Jupiter | N
ASTEROID_BELT | Centauri Belt Alpha | - | - | System Belt | H
JUMPPOINT | Centauri - Elysium | - | - | - | N
JUMPPOINT | Centauri - Nul | - | - | - | N

### CHARON | Charon | SINGLE_STAR
STAR | Charon | - | - | Main Sequence-Dwarf-K | N
PLANET | Charon I | - | - | Terrestrial Rocky | N
PLANET | Charon II | - | - | Smog Planet | N
PLANET | Charon III | - | - | Terrestrial Rocky | H
PLANET | Charon IV | - | - | Ice Giant | N
PLANET | Charon V | - | - | Dwarf Planet | N
ASTEROID_BELT | Charon Belt Alpha | Gedinasho Belt | - | System Belt | N
SATELLITE | Charon 2a | - | Charon II | Planetary Moon | N
SATELLITE | Charon 2b | - | Charon II | Planetary Moon | N
SATELLITE | Charon 3a | Touvoni/Aiya | Charon III | Planetary Moon | N
JUMPPOINT | Charon - Tyrol | - | - | - | N
JUMPPOINT | Charon - Helios | - | - | - | N
JUMPPOINT | Charon - Genesis | - | - | - | N
JUMPPOINT | Charon - Kins | - | - | - | N

### CHRONOS | Chronos | SINGLE_STAR
STAR | Chronos | - | - | Main Sequence-Dwarf-G | N
PLANET | Chronos I | Bruder | - | Dwarf Planet | N
PLANET | Chronos II | Schwester | - | Terrestrial Rocky | N
PLANET | Chronos III | Synthworld | - | Artificial | N
MANMADE | Archangel Station | - | Chronos III | Space Station | H
JUMPPOINT | Chronos - Kellog | - | - | - | N
JUMPPOINT | Chronos - Branaugh | - | - | - | N

### COREL | Corel | SINGLE_STAR
STAR | Corel | - | - | Main Sequence-Dwarf-G | N
PLANET | Corel I | - | - | Iron Planet | N
PLANET | Corel II | - | - | Terrestrial Rocky | N
PLANET | Corel III | Lo | - | Terrestrial Rocky | H
PLANET | Corel IV | Castor | - | Ice Planet | H
PLANET | Corel V | - | - | Gas Giant | N
PLANET | Corel VI | - | - | Protoplanet | N
JUMPPOINT | Corel - Geddon | - | - | - | N
JUMPPOINT | Corel - Nemo | - | - | - | N
JUMPPOINT | Corel - Genesis | - | - | - | N

### DAVIEN | Davien | SINGLE_STAR
STAR | Davien | - | - | Main Sequence-Dwarf-K | N
PLANET | Davien I | - | - | Terrestrial Rocky | N
PLANET | Davien II | Cestulus | - | Terrestrial Rocky | H
PLANET | Davien III | - | - | Smog Planet | N
PLANET | Davien IV | - | - | Ice Giant | N
SATELLITE | Davien 2a | Penselin | Cestulus | Planetary Moon | N
JUMPPOINT | Davien - Kilian | - | - | - | N
JUMPPOINT | Davien - Ferron | - | - | - | N
JUMPPOINT | Davien - Sol | - | - | - | N
JUMPPOINT | Davien - Cathcart | - | - | - | N
JUMPPOINT | Davien - Cano | - | - | - | N
JUMPPOINT | Davien - Bacchus | - | - | - | N

### EEALUS | Ē'aluth (formerly Eealus) | SINGLE_STAR
STAR | Ē'aluth | - | - | Main Sequence-Dwarf-K | N
PLANET | Ē'aluth I | Tua.lu" | - | Puffy Planet | N
PLANET | Ē'aluth II | Kyupuāng | - | Smog Planet | N
PLANET | Ē'aluth III | Ko'li | - | Terrestrial Rocky | H
PLANET | Ē'aluth IV | Xyekyu | - | Gas Dwarf | N
PLANET | Ē'aluth V | Puāngkiil | - | Gas Giant | N
ASTEROID_BELT | Ē'aluth Belt Alpha | - | - | System Belt | N
JUMPPOINT | Ē'aluth - Trise | - | - | - | N
JUMPPOINT | Ē'aluth - La'uo | - | - | - | N
JUMPPOINT | Ē'aluth - Oya | - | - | - | N
JUMPPOINT | Ē'aluth - R.il'a | - | - | - | N

### EL'SIN | El'sin | SINGLE_STAR
STAR | El'sin | - | - | - | N
NOTE: star-only — render NO SCAN DATA state.

### ELLIS | Ellis | SINGLE_STAR
STAR | Ellis | - | - | Main Sequence-Dwarf-F | N
PLANET | Ellis I | - | - | Protoplanet | N
PLANET | Ellis II | - | - | Smog Planet | N
PLANET | Ellis III | Green | - | Ocean Planet | H
PLANET | Ellis IV | Kampos | - | Super-Earth | H
PLANET | Ellis V | Noble | - | Terrestrial Rocky | H
PLANET | Ellis VI | - | - | Terrestrial Rocky | N
PLANET | Ellis VII | - | - | Smog Planet | N
PLANET | Ellis VIII | - | - | Dwarf Planet | N
PLANET | Ellis IX | Walleye | - | Puffy Planet | N
PLANET | Ellis X | Bombora | - | Gas Giant | N
PLANET | Ellis XI | - | - | Protoplanet | N
PLANET | Ellis XII | Judecca | - | Ice Planet | N
PLANET | Ellis XIII | Pinecone | - | Protoplanet | N
ASTEROID_FIELD | Ellis XI Cluster | - | - | System Cluster | N
ASTEROID_BELT | Ellis Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Rings of Ellis VII | - | Ellis VII | Planetary Ring | N
SATELLITE | Ellis 5a | - | Ellis V | Planetary Moon | N
SATELLITE | Ellis 5b | - | Ellis V | Planetary Moon | N
MANMADE | Encole Station | - | Ellis VI | Space Station | H
JUMPPOINT | Ellis - Kilian | - | - | - | N
JUMPPOINT | Ellis - Nexus | - | - | - | N
JUMPPOINT | Ellis - Magnus | - | - | - | N
JUMPPOINT | Ellis - Min | - | - | - | N
JUMPPOINT | Ellis - Taranis | - | - | - | N

### ELYSIUM | Elysium | SINGLE_STAR
STAR | Elysium | - | - | Main Sequence-Dwarf-F | N
PLANET | Elysium I | - | - | Puffy Planet | N
PLANET | Elysium II | - | - | Coreless Planet | N
PLANET | Elysium III | Vosca | - | Desert Planet | H
PLANET | Elysium IV | Jalan | - | Terrestrial Rocky | H
PLANET | Elysium V | - | - | Ice Giant | N
JUMPPOINT | Elysium - Leir | - | - | - | N
JUMPPOINT | Elysium - Vanguard | - | - | - | N
JUMPPOINT | Elysium - Centauri | - | - | - | N
JUMPPOINT | Elysium - Idris | - | - | - | N

### FERRON | Ferron | SINGLE_STAR
STAR | Ferron | - | - | Main Sequence-Dwarf-F | N
PLANET | Ferron I | - | - | Mesoplanet | N
PLANET | Ferron II | - | - | Coreless Planet | N
PLANET | Ferron III | Asura | - | Terrestrial Rocky | H
PLANET | Ferron IV | - | - | Gas Giant | N
JUMPPOINT | Ferron - Davien | - | - | - | N
JUMPPOINT | Ferron - Idris | - | - | - | N
JUMPPOINT | Ferron - Croshaw | - | - | - | N
NOTE: the collapsed Ferron–Oretani jump (2485) is NOT in this data — render it in the severed style from the existing map data.

### FORA | Fora | SINGLE_STAR
STAR | Fora | - | - | Main Sequence-Dwarf-K | N
PLANET | Fora I | - | - | Dwarf Planet | N
PLANET | Fora II | - | - | Coreless Planet | N
PLANET | Fora III | Hyperion | - | Terrestrial Rocky | H
PLANET | Fora IV | - | - | Gas Giant | N
PLANET | Fora V | - | - | Ice Giant | N
ASTEROID_BELT | Fora Belt Alpha | - | - | System Belt | N
JUMPPOINT | Fora - Rhetor | - | - | - | N
JUMPPOINT | Fora - Nemo | - | - | - | N
JUMPPOINT | Fora - Banshee | - | - | - | N

### GARRON | Garron | SINGLE_STAR
STAR | Garron | - | - | Main Sequence-Dwarf-G | N
PLANET | Garron I | - | - | Lava Planet | N
PLANET | Garron II | - | - | Terrestrial Rocky | H
PLANET | Garron III | - | - | Ice Planet | N
PLANET | Garron IV | - | - | Terrestrial Rocky | N
MANMADE | OB Heller | - | Garron II | Space Station | H
JUMPPOINT | Garron - Bacchus | - | - | - | N
JUMPPOINT | Garron - Idris | - | - | - | N
JUMPPOINT | Garron - Leir | - | - | - | N
JUMPPOINT | Garron - Banshee | - | - | - | N

### GEDDON | Geddon | SINGLE_STAR
STAR | Geddon | - | - | Main Sequence-Dwarf-O | N
PLANET | Geddon I | Takto | - | Lava Planet | H
JUMPPOINT | Geddon - Corel | - | - | - | N
JUMPPOINT | Geddon - Gliese | - | - | - | N
JUMPPOINT | Geddon - Bacchus | - | - | - | N

### GENESIS | Genesis | SINGLE_STAR
STAR | Genesis | - | - | Main Sequence-Dwarf-G | N
PLANET | Genesis I | - | - | Mesoplanet | N
PLANET | Genesis II | - | - | Ocean Planet | H
PLANET | Genesis III | - | - | Ice Giant | N
ASTEROID_BELT | Genesis Belt Alpha | - | - | System Belt | N
JUMPPOINT | Genesis - Charon | - | - | - | N
JUMPPOINT | Genesis - Corel | - | - | - | N
JUMPPOINT | Genesis - Taranis | - | - | - | N

### GLIESE | Gliese | SINGLE_STAR
STAR | Gliese | - | - | Main Sequence-Dwarf-A | N
PLANET | Gliese I | - | - | Iron Planet | N
PLANET | Gliese II | - | - | Smog Planet | N
PLANET | Gliese III | - | - | Terrestrial Rocky | N
PLANET | Gliese IV | Nogo | - | Terrestrial Rocky | H
PLANET | Gliese V | - | - | Gas Giant | N
PLANET | Gliese VI | - | - | Protoplanet | N
ASTEROID_BELT | Gliese Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Gliese Belt Beta | - | - | System Belt | N
ASTEROID_FIELD | Gliese Cluster Gamma | - | - | System Cluster | N
MANMADE | Gliese Flotilla | Lyris | - | Space Station | H
JUMPPOINT | Gliese - Geddon | - | - | - | N

### GOSS | Goss | BINARY
STAR | Goss A | - | - | Main Sequence-Dwarf-K | N
STAR | Goss B | - | - | Main Sequence-Dwarf-K | N
PLANET | Goss I | - | - | Terrestrial Rocky | H
PLANET | Goss II | Cassel | - | Terrestrial Rocky | H
PLANET | Goss III | - | - | Super-Earth | H
JUMPPOINT | Goss - Osiris | - | - | - | N
JUMPPOINT | Goss - Tayac | - | - | - | N
JUMPPOINT | Goss - Terra | - | - | - | N
JUMPPOINT | Goss - Helios | - | - | - | N
JUMPPOINT | Goss - Tyrol | - | - | - | N

### GURZIL | Gurzil | SINGLE_STAR
STAR | Gurzil | - | - | Main Sequence-Dwarf-K | N
ASTEROID_BELT | Gurzil Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Protoplanetary Disks (×9) | - | - | System Belt | N
JUMPPOINT | Gurzil - Oya | - | - | - | N
JUMPPOINT | Gurzil - R.il'a | - | - | - | N
JUMPPOINT | Gurzil - Hadrian | - | - | - | N
JUMPPOINT | Gurzil - Horus | - | - | - | N
NOTE: raw data lists nine separate "Protoplanetary Disk" belts — render as one labeled multi-ring band.

### HADES | Hades | SINGLE_STAR
STAR | Hades | - | - | Main Sequence-Dwarf-F | N
PLANET | Hades I | - | - | Mesoplanet | N
PLANET | Hades II | - | - | Terrestrial Rocky | N
PLANET | Hades III | - | - | Smog Planet | N
PLANET | Hades IV | - | - | Terrestrial Rocky | N
ASTEROID_FIELD | Hades IV split | - | Hades IV | System Cluster | N
JUMPPOINT | Hades - Cathcart | - | - | - | N
JUMPPOINT | Hades - Nexus | - | - | - | N
JUMPPOINT | Hades - Nemo | - | - | - | N
NOTE: Hades IV is a shattered planet (the "split" debris field orbits it) — worth a broken-planet render; lore: ancient alien civil war ruins.

### HADRIAN | Hadrian | SINGLE_STAR
STAR | Hadrian | - | - | Giants-Giant-M | N
PLANET | Hadrian I | - | - | Gas Dwarf | N
PLANET | Hadrian II | - | - | Gas Giant | N
PLANET | Hadrian III | - | - | Ice Giant | N
ASTEROID_BELT | Hadrian Belt Alpha | - | - | - | N
MANMADE | Hadrian Flotilla | - | - | Space Station | H
JUMPPOINT | Hadrian - Gurzil | - | - | - | N
JUMPPOINT | Hadrian - Castra | - | - | - | N
JUMPPOINT | Hadrian - Kiel | - | - | - | N
JUMPPOINT | Hadrian - Oya | - | - | - | N
JUMPPOINT | Hadrian - Terra | - | - | - | N
JUMPPOINT | Hadrian - Pyro | - | - | - | N

### HADUR | Yā'mon (formerly Hadur) | SINGLE_STAR
STAR | Yā'mon | - | - | Main Sequence-Dwarf-F | N
PLANET | Yā'mon I | Kuā'li | - | Terrestrial Rocky | N
PLANET | Yā'mon II | Yethlūbl y.ath'o | - | Terrestrial Rocky | N
PLANET | Yā'mon III | Yethlūbl s.yen'o | - | Terrestrial Rocky | N
PLANET | Yā'mon IV | Yām'ping | - | Dwarf Planet | N
ASTEROID_BELT | Yā'mon Belt Alpha | Huichuaihyao y.ath'o se Yā'mon | - | System Belt | N
JUMPPOINT | Yā'mon - Kyuk'ya | - | - | - | N
JUMPPOINT | Yā'mon - Th.us'ūng | - | - | - | N
JUMPPOINT | Yā'mon - Ail'ka | - | - | - | N
JUMPPOINT | Yā'mon - Baker | - | - | - | N

### HELIOS | Helios | SINGLE_STAR
STAR | Helios | - | - | Main Sequence-Dwarf-B | N
PLANET | Helios I | - | - | Terrestrial Rocky | N
PLANET | Helios II | Tangaroa | - | Ocean Planet | H
PLANET | Helios III | - | - | Gas Giant | N
PLANET | Helios IV | - | - | Ice Planet | H
SATELLITE | Helios 2a | - | Tangaroa | Planetary Moon | N
MANMADE | Hephaestus Station | - | Tangaroa | Space Station | H
JUMPPOINT | Helios - Tyrol | - | - | - | N
JUMPPOINT | Helios - Charon | - | - | - | N
JUMPPOINT | Helios - Goss | - | - | - | N
JUMPPOINT | Helios - Taranis | - | - | - | N

### HORUS | Horus | SINGLE_STAR
STAR | Horus | - | - | Main Sequence-Dwarf-M | N
PLANET | Horus I | Serling | - | Terrestrial Rocky | H
PLANET | Horus II | - | - | Desert Planet | N
PLANET | Horus III | - | - | Super Jupiter | N
ASTEROID_BELT | Horus Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Horus Belt Beta | - | - | System Belt | N
JUMPPOINT | Horus - R.il'a | - | - | - | N
JUMPPOINT | Horus - Kiel | - | - | - | N
JUMPPOINT | Horus - Kai'pua | - | - | - | N
JUMPPOINT | Horus - Gurzil | - | - | - | N

### IDRIS | Idris | SINGLE_STAR
STAR | Idris | - | - | Main Sequence-Dwarf-F | N
PLANET | Idris I | - | - | Iron Planet | N
PLANET | Idris II | - | - | Smog Planet | H
PLANET | Idris III | - | - | Ocean Planet | N
PLANET | Idris IV | Locke | - | Terrestrial Rocky | H
PLANET | Idris V | - | - | Protoplanet | N
JUMPPOINT | Idris - Ferron | - | - | - | N
JUMPPOINT | Idris - Rhetor | - | - | - | N
JUMPPOINT | Idris - Elysium | - | - | - | N
JUMPPOINT | Idris - Garron | - | - | - | N

### INDRA | Kyuk'ya (formerly Indra) | BINARY
STAR | Kyuk'ya A | - | - | Main Sequence-Dwarf-A | N
STAR | Kyuk'ya B | - | Kyuk'ya A | White Dwarf-Degenerate-A | N
PLANET | Kyuk'ya I | - | - | Gas Giant | N
PLANET | Kyuk'ya II | - | - | Ice Planet | N
SATELLITE | Kyuk'ya 1a | Pue'nu | Kyuk'ya I | Planetary Moon | H
ASTEROID_BELT | Kyuk'ya Belt Alpha | Huichuaihyao y.ath'o se Kyuk'ya | Kyuk'ya A | System Belt | N
ASTEROID_BELT | Rings of Kyuk'ya I | - | Kyuk'ya I | Planetary Ring | N
JUMPPOINT | Kyuk'ya - Yā'mon | - | - | - | N
JUMPPOINT | Kyuk'ya - Ail'ka | - | - | - | N
JUMPPOINT | Kyuk'ya - Osiris | - | - | - | N
JUMPPOINT | Kyuk'ya - Kins | - | - | - | N

### KABAL | Kabal | SINGLE_STAR
STAR | Kabal | - | - | Main Sequence-Dwarf-F | N
PLANET | Kabal I | - | - | Protoplanet | N
PLANET | Kabal II | - | - | Desert Planet | N
PLANET | Kabal III | - | - | Terrestrial Rocky | H
ASTEROID_FIELD | Kabal Cluster Alpha | - | - | System Cluster | N
JUMPPOINT | Kabal - Leir | - | - | - | N

### KALLIS | Kallis | SINGLE_STAR
STAR | Kallis | - | - | Main Sequence-Dwarf-G | N
PLANET | Kallis I | - | - | Protoplanet | N
PLANET | Kallis II | - | - | Terrestrial Rocky | N
PLANET | Kallis III | - | - | Terrestrial Rocky | N
PLANET | Kallis IV | - | - | Terrestrial Rocky | N
PLANET | Kallis V | - | - | Terrestrial Rocky | N
PLANET | Kallis VI | - | - | Carbon Planet | N
PLANET | Kallis VII | - | - | Gas Giant | N
PLANET | Kallis VIII | - | - | Ice Giant | N
PLANET | Kallis IX | - | - | Dwarf Planet | N
ASTEROID_BELT | Kallis Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Kallis Belt Beta | - | - | System Belt | N
ASTEROID_BELT | Kallis V Accretion Disk | - | Kallis V | - | N
MANMADE | Science Station | OB Station Gryphon | - | Space Station | H
JUMPPOINT | Kallis - Bremen | - | - | - | N
JUMPPOINT | Kallis - Oso | - | - | - | N

### KAYFA | Kai'pua (formerly Kayfa) | SINGLE_STAR
STAR | Kai'pua | - | - | Main Sequence-Dwarf-K | N
PLANET | Kai'pua I | Ui'r.a'ang | - | Carbon Planet | N
PLANET | Kai'pua II | R.aip'uāng | - | Terrestrial Rocky | H
PLANET | Kai'pua III | Kyu'kyu | - | Gas Dwarf | N
PLANET | Kai'pua IV | K.yuk'o | - | Gas Dwarf | N
JUMPPOINT | Kai'pua - R.il'a | - | - | - | N
JUMPPOINT | Kai'pua - Horus | - | - | - | N

### KELLOG | Kellog | SINGLE_STAR
STAR | Kellog | - | - | Main Sequence-Dwarf-G | N
PLANET | Kellog I | - | - | Lava Planet | N
PLANET | Kellog II | Xis | - | Terrestrial Rocky | H
PLANET | Kellog III | - | - | Smog Planet | N
PLANET | Kellog IV | - | - | Super-Earth | N
PLANET | Kellog V | - | - | Gas Dwarf | N
PLANET | Kellog VI | Quarterdeck | - | Ice Planet | H
MANMADE | JusticeStar Satellite | - | - | Space Station | H
MANMADE | OB Station Pegasus | - | Xis | Space Station | H
JUMPPOINT | Kellog - Virgil | - | - | - | N
JUMPPOINT | Kellog - Vector | - | - | - | N
JUMPPOINT | Kellog - Odin | - | - | - | N
JUMPPOINT | Kellog - Chronos | - | - | - | N

### KHABARI | K.ap'a'ri (formerly Khabari) | SINGLE_STAR
STAR | K.ap'a'ri | - | - | - | N
NOTE: star-only — NO SCAN DATA state.

### KIEL | Kiel | SINGLE_STAR
STAR | Kiel | - | - | Main Sequence-Dwarf-F | N
PLANET | Kiel I | - | - | Mesoplanet | N
PLANET | Kiel II | - | - | Terrestrial Rocky | N
PLANET | Kiel III | Severus | - | Terrestrial Rocky | H
PLANET | Kiel IV | - | - | Gas Dwarf | N
PLANET | Kiel V | - | - | Gas Giant | N
PLANET | Kiel VI | - | - | Protoplanet | N
ASTEROID_BELT | Kiel Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Rings of Kiel V | - | Kiel V | Planetary Ring | N
SATELLITE | Kiel 3a | Aemilia | Kiel III | Planetary Moon | N
JUMPPOINT | Kiel - Horus | - | - | - | N
JUMPPOINT | Kiel - Baker | - | - | - | N
JUMPPOINT | Kiel - Hadrian | - | - | - | N

### KILIAN | Kilian | SINGLE_STAR
STAR | Kilian | - | - | Main Sequence-Dwarf-G | N
PLANET | Kilian I | First Sister | - | Puffy Planet | N
PLANET | Kilian II | Second Sister | - | Protoplanet | N
PLANET | Kilian III | Third Sister | - | Protoplanet | N
PLANET | Kilian IV | Magma | - | Lava Planet | N
PLANET | Kilian V | MacArthur | - | Terrestrial Rocky | H
PLANET | Kilian VI | Osha | - | Super-Earth | H
PLANET | Kilian VII | Keene | - | Terrestrial Rocky | H
PLANET | Kilian VIII | - | - | Ocean Planet | N
PLANET | Kilian IX | Corin | - | Ice Planet | H
PLANET | Kilian X | - | - | Dwarf Planet | N
PLANET | Kilian XI | - | - | Gas Giant | N
PLANET | Kilian XII | - | - | Ice Planet | N
PLANET | Kilian XIII | - | - | Dwarf Planet | N
PLANET | Kilian XIV | - | - | Dwarf Planet | N
JUMPPOINT | Kilian - Ellis | - | - | - | N
JUMPPOINT | Kilian - Davien | - | - | - | N
JUMPPOINT | Kilian - Cathcart | - | - | - | N
NOTE: Kilian V (MacArthur) hosts UEE Navy headquarters — tie into the future military-presence layer.

### KINS | Kins | SINGLE_STAR
STAR | Kins | - | - | Main Sequence-Dwarf-K | N
PLANET | Kins I | - | - | Mesoplanet | N
PLANET | Kins II | - | - | Terrestrial Rocky | H
PLANET | Kins III | - | - | Super-Earth | N
PLANET | Kins IV | - | - | Ice Planet | N
PLANET | Kins V | - | - | Gas Giant | N
ASTEROID_BELT | Kins Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Kins Belt Beta | - | - | System Belt | N
JUMPPOINT | Kins - Kyuk'ya | - | - | - | N
JUMPPOINT | Kins - Charon | - | - | - | N

### LEIR | Leir | SINGLE_STAR
STAR | Leir | - | - | Main Sequence-Dwarf-A | N
PLANET | Leir I | - | - | Terrestrial Rocky | H
PLANET | Leir II | Mya | - | Terrestrial Rocky | H
PLANET | Leir III | - | - | Terrestrial Rocky | N
JUMPPOINT | Leir - Garron | - | - | - | N
JUMPPOINT | Leir - Vanguard | - | - | - | N
JUMPPOINT | Leir - Banshee | - | - | - | N
JUMPPOINT | Leir - Yulin | - | - | - | N
JUMPPOINT | Leir - Elysium | - | - | - | N
JUMPPOINT | Leir - Kabal | - | - | - | N

### MARKAHIL | Malkail (formerly Markahil) | SINGLE_STAR
STAR | Malkail | - | - | - | N
NOTE: star-only — NO SCAN DATA state.

### MIN | Min | SINGLE_STAR
PLANET | Min I | Min | - | Rogue Planet | N
SATELLITE | Min 1a | - | Min I | Planetary Moon | N
SATELLITE | Min 1b | - | Min I | Planetary Moon | H
SATELLITE | Min 1c | - | Min I | Planetary Moon | N
SATELLITE | Min 1d | - | Min I | Planetary Moon | N
JUMPPOINT | Min - Nexus | - | - | - | N
JUMPPOINT | Min - Ellis | - | - | - | N
NOTE: NO STAR — Min is a rogue gas giant drifting in deep space; center the view on the planet itself, dark ambiance.

### NEMO | Nemo | SINGLE_STAR
STAR | Nemo | - | - | Main Sequence-Dwarf-F | N
PLANET | Nemo I | - | - | Protoplanet | N
PLANET | Nemo II | - | - | Mesoplanet | N
PLANET | Nemo III | Ergo | - | Ocean Planet | H
JUMPPOINT | Nemo - Hades | - | - | - | N
JUMPPOINT | Nemo - Corel | - | - | - | N
JUMPPOINT | Nemo - Fora | - | - | - | N

### NEXUS | Nexus | SINGLE_STAR
STAR | Nexus | - | - | Main Sequence-Dwarf-A | N
PLANET | Nexus I | - | - | Protoplanet | N
PLANET | Nexus II | - | - | Smog Planet | N
PLANET | Nexus III | - | - | Terrestrial Rocky | H
PLANET | Nexus IV | Lago | - | Terrestrial Rocky | H
PLANET | Nexus V | The Red God | - | Gas Giant | N
ASTEROID_BELT | Nexus Belt Alpha | Elcibre Belt | - | System Belt | N
JUMPPOINT | Nexus - Cathcart | - | - | - | N
JUMPPOINT | Nexus - Hades | - | - | - | N
JUMPPOINT | Nexus - Ellis | - | - | - | N
JUMPPOINT | Nexus - Min | - | - | - | N

### NUL | Nul | SINGLE_STAR
STAR | Nul | - | - | Variable | N
PLANET | Nul I | - | - | Dwarf Planet | N
PLANET | Nul II | - | - | Iron Planet | N
PLANET | Nul III | Cole | - | Terrestrial Rocky | H
PLANET | Nul IV | - | - | Gas Giant | N
PLANET | Nul V | Ashana | - | Desert Planet | H
JUMPPOINT | Nul - Croshaw | - | - | - | N
JUMPPOINT | Nul - Caliban | - | - | - | N
JUMPPOINT | Nul - Centauri | - | - | - | N
JUMPPOINT | Nul - Vega | - | - | - | N
JUMPPOINT | Nul - Oberon | - | - | - | N

### OBERON | Oberon | SINGLE_STAR
STAR | Oberon | - | - | White Dwarf-Degenerate-A | N
PLANET | Oberon I | Gonn | - | Super-Earth | H
PLANET | Oberon II | Uriel | - | Terrestrial Rocky | H
PLANET | Oberon III | - | - | Protoplanet | N
PLANET | Oberon IV | - | - | Protoplanet | N
PLANET | Oberon V | - | - | Mesoplanet | N
PLANET | Oberon VI | - | - | Gas Dwarf | N
PLANET | Oberon VII | - | - | Gas Giant | N
JUMPPOINT | Oberon - Tiber | - | - | - | N
JUMPPOINT | Oberon - Virgil | - | - | - | N
JUMPPOINT | Oberon - Caliban | - | - | - | N
JUMPPOINT | Oberon - Vega | - | - | - | N
JUMPPOINT | Oberon - Nul | - | - | - | N

### ODIN | Odin | SINGLE_STAR
STAR | Odin | - | - | White Dwarf-Degenerate-A | N
ASTEROID_FIELD | Odin I | The Coil | - | System Cluster | N
PLANET | Odin II | - | - | Chthonian Planet | N
PLANET | Odin III | - | - | Chthonian Planet | N
PLANET | Odin IV | - | - | Gas Giant | N
SATELLITE | Odin 1a | Gainey | Odin I | Planetary Moon | N
SATELLITE | Odin 2a | Vili | Odin II | Planetary Moon | N
JUMPPOINT | Odin - Kellog | - | - | - | N
JUMPPOINT | Odin - Nyx | - | - | - | N
JUMPPOINT | Odin - Tanga | - | - | - | N
NOTE: Odin I is a destroyed planet — The Coil is its debris field (permanent lightning storms); Gainey is its surviving moon.

### ORETANI | Oretani | SINGLE_STAR
STAR | Oretani | - | - | Main Sequence-Dwarf-K | N
PLANET | Oretani I | - | - | Mesoplanet | N
PLANET | Oretani II | - | - | Ocean Planet | N
PLANET | Oretani III | - | - | Ice Planet | N
PLANET | Oretani IV | - | - | Gas Dwarf | N
PLANET | Oretani V | - | - | Gas Giant | N
PLANET | Oretani VI | - | - | Dwarf Planet | N
ASTEROID_BELT | Oretani Belt Alpha | - | - | System Belt | N
NOTE: no jump points in data (collapsed 2485) — render the severed Ferron jump in broken style; all data here predates the collapse; overlay "LAST SURVEY 2485 — NO CONTACT".

### ORION | Orion | SINGLE_STAR
STAR | Orion | - | - | Main Sequence-Dwarf-M | N
PLANET | Orion I | - | - | Protoplanet | N
PLANET | Orion II | - | - | Smog Planet | N
PLANET | Orion III | Armitage | - | Terrestrial Rocky | H
PLANET | Orion IV | Abyss | - | Gas Giant | N
ASTEROID_BELT | Orion Belt Alpha | - | - | System Belt | N
JUMPPOINT | Orion - Tiber | - | - | - | N
JUMPPOINT | Orion - Caliban | - | - | - | N
JUMPPOINT | Orion - Viking | - | - | - | N
JUMPPOINT | Orion - VS-9 "Vulture" | - | - | - | N

### OSIRIS | Osiris | SINGLE_STAR
STAR | Osiris | - | - | Main Sequence-Dwarf-K | N
PLANET | Osiris I | Etos | - | Terrestrial Rocky | H
PLANET | Osiris II | - | - | Gas Giant | N
ASTEROID_BELT | Osiris Belt Alpha | - | - | System Belt | H
MANMADE | OB Kobold | - | Etos | Space Station | H
JUMPPOINT | Osiris - Kyuk'ya | - | - | - | N
JUMPPOINT | Osiris - Goss | - | - | - | N
JUMPPOINT | Osiris - Baker | - | - | - | N

### OSO | Oso | SINGLE_STAR
STAR | Oso | - | - | Main Sequence-Dwarf-F | N
PLANET | Oso I | - | - | Lava Planet | N
PLANET | Oso II | - | - | Terrestrial Rocky | H
PLANET | Oso III | - | - | Gas Giant | N
PLANET | Oso IV | - | - | Terrestrial Rocky | N
PLANET | Oso V | - | - | Ice Giant | N
PLANET | Oso VI | - | - | Dwarf Planet | N
MANMADE | OB Chimera | Yogi Station | - | Space Station | H
JUMPPOINT | Oso - Kallis | - | - | - | N
JUMPPOINT | Oso - Pyro | - | - | - | N
JUMPPOINT | Oso - Castra | - | - | - | N
NOTE: Oso II hosts the Osoians (FCA-protected) — carry the FCA badge into the system view.

### OYA | Oya | SINGLE_STAR
STAR | Oya | - | - | Main Sequence-Dwarf-G | N
PLANET | Oya I | - | - | Terrestrial Rocky | N
PLANET | Oya II | - | - | Coreless Planet | N
PLANET | Oya III | - | - | Terrestrial Rocky | H
PLANET | Oya IV | - | - | Dwarf Planet | N
JUMPPOINT | Oya - Tohil | - | - | - | N
JUMPPOINT | Oya - Gurzil | - | - | - | N
JUMPPOINT | Oya - Ē'aluth | - | - | - | N
JUMPPOINT | Oya - Castra | - | - | - | N
JUMPPOINT | Oya - Hadrian | - | - | - | N
NOTE: Oya III carries the shared-sovereignty marker (sovereign Xi'an enclave) — split-disc styling in the system view too.

### PALLAS | Th.us'ūng (formerly Pallas) | SINGLE_STAR
STAR | Th.us'ūng | - | - | Main Sequence-Dwarf-G | N
PLANET | Th.us'ūng I | - | - | Iron Planet | N
PLANET | Th.us'ūng II | K.yuy'a'than | - | Smog Planet | N
PLANET | Th.us'ūng III | Se'kith | - | Terrestrial Rocky | H
PLANET | Th.us'ūng IV | Hua'nam | - | Gas Giant | H
PLANET | Th.us'ūng V | H.ua'u | - | Dwarf Planet | N
ASTEROID_BELT | Th.us'ūng Belt Alpha | Huichuaihyao y.ath'o se Th.us'ūng | - | System Belt | N
JUMPPOINT | Th.us'ūng - T.āl | - | - | - | N
JUMPPOINT | Th.us'ūng - Baker | - | - | - | N
JUMPPOINT | Th.us'ūng - Yā'mon | - | - | - | N

### RHETOR | Rhetor | SINGLE_STAR
STAR | Rhetor | - | - | Main Sequence-Dwarf-G | N
PLANET | Rhetor I | - | - | Mesoplanet | N
PLANET | Rhetor II | Persei | - | Terrestrial Rocky | H
PLANET | Rhetor III | Reisse | - | Terrestrial Rocky | H
PLANET | Rhetor IV | Mentor | - | Terrestrial Rocky | H
PLANET | Rhetor V | - | - | Gas Giant | N
JUMPPOINT | Rhetor - Croshaw | - | - | - | N
JUMPPOINT | Rhetor - Idris | - | - | - | N
JUMPPOINT | Rhetor - Fora | - | - | - | N

### RIHLAH | R.il'a (formerly Rihlah) | SINGLE_STAR
STAR | R.il'a | - | - | Main Sequence-Dwarf-A | N
PLANET | R.il'a I | Chuai'chuai | - | Protoplanet | N
PLANET | R.il'a II | P.uay'aha | - | Puffy Planet | N
PLANET | R.il'a III | Ping'leth | - | Terrestrial Rocky | N
PLANET | R.il'a IV | Xōl'uu | - | Terrestrial Rocky | H
PLANET | R.il'a V | Xi | - | Super-Earth | H
PLANET | R.il'a VI | Pi'pa | - | Dwarf Planet | N
JUMPPOINT | R.il'a - Ē'aluth | - | - | - | N
JUMPPOINT | R.il'a - Gurzil | - | - | - | N
JUMPPOINT | R.il'a - Horus | - | - | - | N
JUMPPOINT | R.il'a - Kai'pua | - | - | - | N

### TAL | T.āl | SINGLE_STAR
STAR | T.āl | - | - | Main Sequence-Dwarf-A | N
PLANET | T.āl I | Y.ōm'e | - | Mesoplanet | N
PLANET | T.āl II | Oli'xa | - | Terrestrial Rocky | H
PLANET | T.āl III | Lūng'xyi | - | Terrestrial Rocky | H
PLANET | T.āl IV | Lixāuu | - | Terrestrial Rocky | H
PLANET | T.āl V | Ryōl | - | Terrestrial Rocky | H
PLANET | T.āl VI | Chuaiton | - | Super-Earth | N
PLANET | T.āl VII | Kyu'nao | - | Gas Giant | N
JUMPPOINT | T.āl - Th.us'ūng | - | - | - | N
JUMPPOINT | T.āl - Ail'ka | - | - | - | N

### TAMSA | Tamsa | SINGLE_STAR
BLACKHOLE | Tamsa | - | - | Stellar | N
PLANET | Tamsa I | - | - | Chthonian Planet | N
PLANET | Tamsa II | - | - | Gas Giant | N
JUMPPOINT | Tamsa - Banshee | - | - | - | N
NOTE: the central object is a BLACK HOLE — accretion-disk render, no star glow.

### TANGA | Tanga | SINGLE_STAR
STAR | Tanga | - | - | White Dwarf-Degenerate-A | N
PLANET | Tanga I | - | - | Chthonian Planet | N
PLANET | Tanga II | - | - | Ice Giant | N
ASTEROID_BELT | Tanga Belt Alpha | - | - | System Belt | N
JUMPPOINT | Tanga - Odin | - | - | - | N
JUMPPOINT | Tanga - Bremen | - | - | - | N

### TARANIS | Taranis | SINGLE_STAR
STAR | Taranis | - | - | Main Sequence-Dwarf-A | N
PLANET | Taranis I | - | - | Dwarf Planet | N
PLANET | Taranis II | - | - | Terrestrial Rocky | N
PLANET | Taranis III | - | - | Smog Planet | N
PLANET | Taranis IV | - | - | Gas Giant | N
ASTEROID_BELT | Taranis Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Taranis Belt Beta | - | - | System Belt | N
SATELLITE | Taranis 2a | Broken Moon | Taranis II | Planetary Moon | N
ASTEROID_FIELD | Taranis 2a Debris | - | Taranis II | System Cluster | N
JUMPPOINT | Taranis - Genesis | - | - | - | N
JUMPPOINT | Taranis - Helios | - | - | - | N
JUMPPOINT | Taranis - Ellis | - | - | - | N
JUMPPOINT | Taranis - Terra | - | - | - | N

### TAYAC | Tayac | SINGLE_STAR
STAR | Tayac | - | - | Main Sequence-Dwarf-G | N
PLANET | Tayac I | - | - | Terrestrial Rocky | N
PLANET | Tayac II | - | - | Gas Giant | N
PLANET | Tayac III | Shepherd | - | Dwarf Planet | N
ASTEROID_BELT | Tayac Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Rings of Tayac II | - | Tayac II | Planetary Ring | N
MANMADE | The ARK | - | Tayac I | Space Station | H
JUMPPOINT | Tayac - Baker | - | - | - | N
JUMPPOINT | Tayac - Terra | - | - | - | N
JUMPPOINT | Tayac - Goss | - | - | - | N
NOTE: The ARK is the diegetic home of the Starmap itself — easter-egg-worthy.

### TIBER | Tiber | SINGLE_STAR
STAR | Tiber | - | - | Main Sequence-Dwarf-K | N
PLANET | Tiber I | - | - | Terrestrial Rocky | H
PLANET | Tiber II | - | - | Desert Planet | N
ASTEROID_BELT | Tiber Belt Alpha | - | - | System Belt | N
JUMPPOINT | Tiber - Virgil | - | - | - | N
JUMPPOINT | Tiber - Orion | - | - | - | N
JUMPPOINT | Tiber - Vector | - | - | - | N
JUMPPOINT | Tiber - Oberon | - | - | - | N

### TOHIL | Tohil | SINGLE_STAR
STAR | Tohil | - | - | Main Sequence-Dwarf-K | N
PLANET | Tohil I | - | - | Lava Planet | N
PLANET | Tohil II | - | - | Mesoplanet | N
PLANET | Tohil III | - | - | Ocean Planet | H
PLANET | Tohil IV | - | - | Super-Earth | N
ASTEROID_BELT | Tohil Belt Alpha | - | - | System Belt | N
JUMPPOINT | Tohil - Oya | - | - | - | N
JUMPPOINT | Tohil - La'uo | - | - | - | N
JUMPPOINT | Tohil - Nyx | - | - | - | N

### TRISE | Trise | SINGLE_STAR
STAR | Trise | - | - | Main Sequence-Dwarf-G | N
PLANET | Trise I | - | - | Super-Earth | H
MANMADE | Banu Station | Trise Flotilla | Trise I | Space Station | H
JUMPPOINT | Trise - La'uo | - | - | - | N
JUMPPOINT | Trise - Ē'aluth | - | - | - | N

### TYROL | Tyrol | SINGLE_STAR
STAR | Tyrol A | - | - | Subgiant | N
STAR | Tyrol B | - | Tyrol A | White Dwarf-Degenerate-A | N
PLANET | Tyrol I | - | - | Terrestrial Rocky | H
PLANET | Tyrol II | - | - | Iron Planet | N
PLANET | Tyrol III | - | - | Coreless Planet | N
PLANET | Tyrol IV | - | - | Chthonian Planet | N
PLANET | Tyrol V | - | - | Chthonian Planet | H
PLANET | Tyrol VI | - | - | Gas Giant | N
PLANET | Tyrol VII | - | - | Protoplanet | N
ASTEROID_BELT | Tyrol Belt Alpha | - | - | System Belt | N
SATELLITE | Tyrol 1a | Lanisto | Tyrol I | Planetary Moon | H
JUMPPOINT | Tyrol - Charon | - | - | - | N
JUMPPOINT | Tyrol - Helios | - | - | - | N
JUMPPOINT | Tyrol - Goss | - | - | - | N
NOTE: Tyrol's star is dying (subgiant swelling) — lore: the system is on borrowed time.

### AYR'KA | Ail'ka (formerly Ayr'ka) | SINGLE_STAR
STAR | Ail'ka | - | - | Main Sequence-Dwarf-B | N
PLANET | Ail'ka I | Xyeping | - | Protoplanet | N
PLANET | Ail'ka II | K'ya.k'uing | - | Terrestrial Rocky | N
PLANET | Ail'ka III | Ye'ten | - | Terrestrial Rocky | H
PLANET | Ail'ka IV | M.iiy'ong | - | Terrestrial Rocky | H
PLANET | Ail'ka V | Ye'ton | - | Gas Dwarf | N
ASTEROID_BELT | Ail'ka Belt Alpha | Huichuaihyao y.ath'o se Ail'ka | - | System Belt | N
ASTEROID_BELT | Ail'ka Belt Beta | Huichuaihyao sy.en'o se Ail'ka | - | System Belt | N
JUMPPOINT | Ail'ka - T.āl | - | - | - | N
JUMPPOINT | Ail'ka - Kyuk'ya | - | - | - | N
JUMPPOINT | Ail'ka - Yā'mon | - | - | - | N

### VEGA | Vega | SINGLE_STAR
STAR | Vega | - | - | Main Sequence-Dwarf-G | N
PLANET | Vega I | - | - | Mesoplanet | N
PLANET | Vega II | Aremis | - | Terrestrial Rocky | H
PLANET | Vega III | Selene | - | Terrestrial Rocky | H
PLANET | Vega IV | - | - | Gas Giant | N
SATELLITE | Vega 2a | - | Aremis | Planetary Moon | N
SATELLITE | Vega 2b | - | Aremis | Planetary Moon | N
ASTEROID_BELT | Vega Belt Alpha | - | - | System Belt | N
ASTEROID_BELT | Rings of Aremis | - | Aremis | Planetary Ring | N
POI | VANDUUL-WARN-01 | Vanduul Attack | Aremis | POI | N
JUMPPOINT | Vega - Nul | - | - | - | N
JUMPPOINT | Vega - Virgil | - | - | - | N
JUMPPOINT | Vega - Oberon | - | - | - | N
JUMPPOINT | Vega - Bremen | - | - | - | N
NOTE: the POI is the Battle of Vega II site — render as red ⚠ on Aremis.

### VIRGIL | Virgil | SINGLE_STAR
STAR | Virgil | - | - | Main Sequence-Dwarf-K | N
PLANET | Virgil I | Cyrene | - | Terrestrial Rocky | H
PLANET | Virgil II | Sino | - | Smog Planet | N
PLANET | Virgil III | - | - | Ice Giant | N
SATELLITE | Virgil 1a | Jai | Virgil I | Planetary Moon | N
SATELLITE | Virgil 1b | Corsito | Virgil I | Planetary Moon | N
SATELLITE | Virgil 1c | Epheet | Virgil I | Planetary Moon | N
SATELLITE | Virgil 3a | Erna | Virgil III | Planetary Moon | N
SATELLITE | Virgil 3b | Jarl | Virgil III | Planetary Moon | N
ASTEROID_BELT | Virgil Belt Alpha | Gideon's Belt | - | System Belt | N
JUMPPOINT | Virgil - Vega | - | - | - | N
JUMPPOINT | Virgil - Tiber | - | - | - | N
JUMPPOINT | Virgil - Nyx | - | - | - | N
JUMPPOINT | Virgil - Kellog | - | - | - | N
JUMPPOINT | Virgil - Oberon | - | - | - | N

### VULTURE | VS-9 "Vulture" | SINGLE_STAR
STAR | Vulture | - | - | - | N
JUMPPOINT | VS-9 "Vulture" - Orion | - | - | - | N
NOTE: near-empty — NO SCAN DATA state; VS designation = official UEE military naming for Vanduul-held systems.

### Star-only systems (all render the NO SCAN DATA state; jump connections come from existing map tunnel data)
VAGABOND | Vagabond — star only
VANGUARD | Vanguard — star only + jumps: Leir, Elysium
VECTOR | Vector — star only + jumps: Tiber, Kellog
VENDETTA | Vendetta — star only
VERITAS | Veritas — star only
VERMILION | Vermilion (current spelling, one L) — star only
VESPER | Vesper — star only
VIKING | Viking — star only + jumps: Orion, Caliban
VIRGO | Virgo — star only
VOLT | Volt — star only
VOODOO | Voodoo — star only

### VIRTUS | La'uo (formerly Virtus) | SINGLE_STAR
STAR | La'uo | - | - | Giants-Giant-M | N
PLANET | La'uo I | Pi'tua | - | Evaporating Planet | N
PLANET | La'uo II | Yengchuai | - | Lava Planet | H
PLANET | La'uo III | Kyu'ām | - | Smog Planet | N
PLANET | La'uo IV | S.ap'uāng | - | Gas Giant | N
ASTEROID_BELT | La'uo Belt Alpha | Huichuaihyao y.ath'o se La'uo | - | System Belt | N
ASTEROID_BELT | La'uo Belt Beta | Huichuaihyao sy.en'o se La'uo | - | System Belt | N
JUMPPOINT | La'uo - Tohil | - | - | - | N
JUMPPOINT | La'uo - Trise | - | - | - | N
JUMPPOINT | La'uo - Ē'aluth | - | - | - | N

### YULIN | Yulin | SINGLE_STAR
STAR | Yulin | - | - | Main Sequence-Dwarf-G | N
PLANET | Yulin I | - | - | Iron Planet | N
PLANET | Yulin II | - | - | Smog Planet | N
PLANET | Yulin III | - | - | Terrestrial Rocky | H
PLANET | Yulin IV | - | - | Desert Planet | N
PLANET | Yulin V | - | - | Ice Giant | N
PLANET | Yulin VI | - | - | Gas Giant | N
ASTEROID_FIELD | Yulin Cluster Alpha | - | - | System Cluster | N
MANMADE | Buloi Sataball Arena | - | Yulin II | Space Station | H
MANMADE | Yulin Flotilla | - | Yulin | Space Station | H
JUMPPOINT | Yulin - Banshee | - | - | - | N
JUMPPOINT | Yulin - Leir | - | - | - | N

---
Data source: Star Citizen Wiki API (api.star-citizen.wiki, GET /api/v2/starsystems/{CODE}?include=celestialObjects), which mirrors the RSI ARK Starmap. Collected Aug 2026. Minor transcription caveats: object counts were spot-checked but individual subtype/habitable flags on obscure objects may deviate; treat the API as authority if a discrepancy matters.
