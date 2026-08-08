/* Territory engine tests — run as part of the build: node dev/test_territory.js
   (build_data.py invokes this automatically after regenerating scdata.json). */
const fs = require('fs'), path = require('path');
const TERRITORY = require('./territory.js');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'scdata.json'), 'utf8'));
const byName = {}; DATA.systems.forEach(s => byName[s.name] = s);

let fails = 0;
const check = (label, got, exp) => {
  if(got !== exp){ console.error(`FAIL ${label}: got ${got}, expected ${exp}`); fails++; }
};

/* resolver outputs (style-independent except the occupied systems) */
const EXPECT = {
  Pyro: null, Nyx: null, Cathcart: null, Oberon: null,
  Oso: 'UEE', Kallis: 'UEE', Cano: 'UEE', Oya: 'UEE',
  Oretani: 'UEE', Vega: 'UEE', Trise: 'BANU', Orion: 'UEE',
};
for(const [name, exp] of Object.entries(EXPECT))
  check(`ownerOf(${name}, claim)`, TERRITORY.ownerOf(byName[name], 'claim'), exp);
check(`ownerOf(Orion, local)`, TERRITORY.ownerOf(byName['Orion'], 'local'), 'VNCL');

/* rendered ownership: every Unclaimed system sits in a null pocket —
   at its own position and on a radius-5 circle around it, both variants */
for(const style of ['claim', 'local']){
  const at = TERRITORY.makeOwnerAt(DATA.systems, style);
  const ownerAt = (x, y) => { const sd = at(x, y); return sd ? sd.owner : null; };
  for(const s of DATA.systems.filter(s => s.aff === 'UNC')){
    check(`${style}: owner at ${s.name}`, ownerAt(s.x, s.y), null);
    for(let k = 0; k < 8; k++){
      const a = k * Math.PI / 4;
      check(`${style}: owner at ${s.name} r5 ${k*45}deg`,
            ownerAt(s.x + 5*Math.cos(a), s.y + 5*Math.sin(a)), null);
    }
  }
}

if(fails){ console.error(fails + ' failure(s)'); process.exit(1); }
console.log('territory tests passed (' +
  Object.keys(EXPECT).length + ' resolver checks, ' +
  DATA.systems.filter(s => s.aff === 'UNC').length * 9 * 2 + ' pocket probes)');
