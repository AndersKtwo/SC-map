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
   at its own position and on a radius-5 circle around it, both variants.
   Plus territory cohesion: disjoint filled islands per faction stay within
   budget (holes from unclaimed pockets do not count as splits). */
const ISLAND_BUDGET = {UEE: 3, XIAN: [2, 2], BANU: 3, VNCL: 2}; // XIAN must be exactly 2
for(const style of ['claim', 'local']){
  const at = TERRITORY.makeOwnerAt(DATA.systems, DATA.tunnels, style);
  const ownerAt = (x, y) => { const sd = at(x, y); return sd ? sd.owner : null; };
  for(const s of DATA.systems.filter(s => s.aff === 'UNC')){
    check(`${style}: owner at ${s.name}`, ownerAt(s.x, s.y), null);
    for(let k = 0; k < 8; k++){
      const a = k * Math.PI / 4;
      check(`${style}: owner at ${s.name} r5 ${k*45}deg`,
            ownerAt(s.x + 5*Math.cos(a), s.y + 5*Math.sin(a)), null);
    }
  }
  // island count per faction on the same pruned grid the page renders from
  const g = TERRITORY.computeGrid(DATA.systems, DATA.tunnels, style, 22, 1.8);
  const {nx, ny, minX, minY} = g, GRID = g.cell, grid = g.owners;
  const counts={}, members={};
  const seen=new Uint8Array(nx*ny);
  const label=new Int32Array(nx*ny).fill(-1);
  let nlabels=0;
  for(let k0=0;k0<nx*ny;k0++){
    const fac=grid[k0];
    if(!fac || seen[k0]) continue;
    counts[fac]=(counts[fac]||0)+1;
    const lb=nlabels++;
    const stack=[k0]; seen[k0]=1; label[k0]=lb;
    while(stack.length){
      const k=stack.pop(), i=k%nx, j=(k-i)/nx;
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const i2=i+di, j2=j+dj;
        if(i2<0||j2<0||i2>=nx||j2>=ny) continue;
        const k2=i2+j2*nx;
        if(!seen[k2] && grid[k2]===fac){ seen[k2]=1; label[k2]=lb; stack.push(k2); }
      }
    }
  }
  for(const s of DATA.systems){
    const i=Math.round((s.x-minX)/GRID), j=Math.round((s.y-minY)/GRID);
    const lb=label[i+j*nx];
    if(lb>=0) (members[lb]=members[lb]||[]).push(s.name);
  }
  for(const [fac, budget] of Object.entries(ISLAND_BUDGET)){
    const n=counts[fac]||0;
    const ok = Array.isArray(budget) ? (n>=budget[0] && n<=budget[1]) : n<=budget;
    if(!ok){
      console.error(`FAIL islands ${style}: ${fac}=${n}, budget ${JSON.stringify(budget)}`);
      Object.values(members).forEach(m=>{
        if(m.some(nm=>{const s=byName[nm]; return TERRITORY.ownerOf(s,style)===fac;}))
          console.error(`    island: ${m.join(', ')}`);
      });
      fails++;
    }
    else console.log(`  islands ${style}: ${fac}=${n} ok`);
  }
}

if(fails){ console.error(fails + ' failure(s)'); process.exit(1); }
console.log('territory tests passed (' +
  Object.keys(EXPECT).length + ' resolver checks, ' +
  DATA.systems.filter(s => s.aff === 'UNC').length * 9 * 2 + ' pocket probes)');
