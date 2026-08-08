/* Territory engine: ownership resolver + nearest-seed (Voronoi) assignment.
   Shared verbatim between the page (inlined by build_data.py at the
   __ENGINE__ placeholder) and dev/test_territory.js — territory is never
   hand-painted; everything renders from this file's two rules:
   1. ownerOf() decides who owns a system (first match wins).
   2. makeOwnerAt() assigns every point in space to its nearest seed —
      all systems plus a jittered grid of void seeds (owner: nobody)
      covering space not near any system. Unclaimed systems project a
      guaranteed POCKET radius (additively weighted Voronoi) so neutral
      pockets stay clearly visible even where owned neighbors sit close. */
const TERRITORY = (function(){
  const RADIUS = 16;          // void seeds excluded within this of any system — sets blob reach & cohesion
  const VOID_SPACING = 11;    // world units between void seeds
  const VOID_JITTER = 4.2;    // deterministic wobble so borders look organic
  const LANE_STEP = 4;        // lane seeds interpolated this often along every jump lane
  const LANE_CLEAR = 8;       // void seeds also excluded this close to a lane seed (corridor width)
  const POCKET = 5.6;         // guaranteed neutral radius around unclaimed systems
  const UNCLAIMED_WEIGHT = 3; // beyond POCKET, unclaimed influence decays this much
                              // faster, so surrounded systems keep only a small halo

  /* the ONE ownership resolver — first match wins */
  function ownerOf(s, style){
    if(s.aff === 'UNC') return null;                       // (a) unclaimed space
    if(s.lost) return style === 'claim' ? 'UEE' : 'VNCL';  // (b) occupied UEE claims
    if(s.fca) return 'UEE';                                // (c) FCA: UEE-administered
    if(s.aff === 'DEV') return null;                       // (d) developing, not FCA
    return s.aff;                                          // (e) own affiliation
  }

  function buildSeeds(systems, tunnels, style){
    // system seeds first (they win distance ties against later seeds)
    const seeds = systems.map(s => ({x: s.x, y: s.y, owner: ownerOf(s, style), sys: s}));
    // lane seeds: territory follows the jump network — every lane is interpolated,
    // each half attributed to its endpoint system (StellarMaps-style)
    const byId = {}; systems.forEach(s => byId[s.id] = s);
    const laneSeeds = [];
    (tunnels || []).forEach(t => {
      const a = byId[t.a], b = byId[t.b];
      if(!a || !b) return;
      // lanes with an unclaimed endpoint get no seeds — no null corridors
      if(ownerOf(a, style) === null || ownerOf(b, style) === null) return;
      const d = Math.hypot(b.x-a.x, b.y-a.y), n = Math.floor(d/LANE_STEP);
      for(let k=1; k<n; k++){
        const f = k/n, sys = f < 0.5 ? a : b;
        // each half reaches at most RADIUS from its endpoint, so long lanes
        // don't drag territory across the map or slice foreign space
        if(Math.min(f, 1-f)*d > RADIUS) continue;
        laneSeeds.push({x: a.x+(b.x-a.x)*f, y: a.y+(b.y-a.y)*f,
                        owner: ownerOf(sys, style), sys, lane: true});
      }
    });
    seeds.push(...laneSeeds);
    let minX=1e9, maxX=-1e9, minY=1e9, maxY=-1e9;
    systems.forEach(s=>{minX=Math.min(minX,s.x); maxX=Math.max(maxX,s.x);
                        minY=Math.min(minY,s.y); maxY=Math.max(maxY,s.y);});
    // deterministic PRNG; seed chosen so the discrete void draw satisfies the
    // cohesion budgets in dev/test_territory.js (lobes split, mainlands fuse)
    let rs=2; const rnd=()=>{rs=(rs*16807)%2147483647; return rs/2147483647;};
    for(let gy=minY-VOID_SPACING*2; gy<=maxY+VOID_SPACING*2; gy+=VOID_SPACING){
      for(let gx=minX-VOID_SPACING*2; gx<=maxX+VOID_SPACING*2; gx+=VOID_SPACING){
        const x=gx+(rnd()-0.5)*2*VOID_JITTER, y=gy+(rnd()-0.5)*2*VOID_JITTER;
        let clear=true;
        for(const s of systems){
          const dx=s.x-x, dy=s.y-y;
          if(dx*dx+dy*dy < RADIUS*RADIUS){ clear=false; break; }
        }
        if(clear) for(const ls of laneSeeds){
          const dx=ls.x-x, dy=ls.y-y;
          if(dx*dx+dy*dy < LANE_CLEAR*LANE_CLEAR){ clear=false; break; }
        }
        if(clear) seeds.push({x, y, owner: null, sys: null});
      }
    }
    return seeds;
  }

  /* nearest-seed lookup; returns the winning seed (owner + backing system) */
  function makeOwnerAt(systems, tunnels, style){
    const seeds = buildSeeds(systems, tunnels, style);
    return function(x, y){
      let best=null, bd=Infinity;
      for(const sd of seeds){
        let d = Math.hypot(sd.x-x, sd.y-y);
        // unclaimed systems: guaranteed pocket, then rapidly decaying influence
        if(sd.sys && !sd.lane && sd.owner===null) d = Math.max(0, d-POCKET)*UNCLAIMED_WEIGHT;
        if(d<bd){ bd=d; best=sd; }
      }
      return best;
    };
  }

  /* full grid assignment — the single source of truth for rendered territory.
     Assigns every cell to its nearest seed, then prunes orphan slivers:
     a connected component that contains no system of its owner is not
     territory (it's lane-tongue debris) and reverts to void. */
  function computeGrid(systems, tunnels, style, pad, cell){
    const at = makeOwnerAt(systems, tunnels, style);
    let minX=1e9, maxX=-1e9, minY=1e9, maxY=-1e9;
    systems.forEach(s=>{minX=Math.min(minX,s.x); maxX=Math.max(maxX,s.x);
                        minY=Math.min(minY,s.y); maxY=Math.max(maxY,s.y);});
    minX-=pad; maxX+=pad; minY-=pad; maxY+=pad;
    const nx=Math.ceil((maxX-minX)/cell)+2, ny=Math.ceil((maxY-minY)/cell)+2;
    const owners=new Array(nx*ny).fill(null);
    const occ=new Uint8Array(nx*ny);
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
      const sd=at(minX+i*cell, minY+j*cell);
      owners[i+j*nx]=sd?sd.owner:null;
      if(style==='claim' && sd && sd.sys && sd.sys.lost) occ[i+j*nx]=1;
    }
    // home cells: which component label each faction's systems live in
    const label=new Int32Array(nx*ny).fill(-1);
    let nl=0;
    for(let k0=0;k0<nx*ny;k0++){
      if(owners[k0]===null || label[k0]>=0) continue;
      const own=owners[k0], stack=[k0]; label[k0]=nl;
      while(stack.length){
        const k=stack.pop(), i=k%nx, j=(k-i)/nx;
        if(i>0    && label[k-1]<0  && owners[k-1]===own){ label[k-1]=nl;  stack.push(k-1); }
        if(i<nx-1 && label[k+1]<0  && owners[k+1]===own){ label[k+1]=nl;  stack.push(k+1); }
        if(j>0    && label[k-nx]<0 && owners[k-nx]===own){ label[k-nx]=nl; stack.push(k-nx); }
        if(j<ny-1 && label[k+nx]<0 && owners[k+nx]===own){ label[k+nx]=nl; stack.push(k+nx); }
      }
      nl++;
    }
    const anchored=new Uint8Array(nl);
    for(const s of systems){
      const own=ownerOf(s, style);
      if(own===null) continue;
      const i=Math.round((s.x-minX)/cell), j=Math.round((s.y-minY)/cell);
      const lb=label[i+j*nx];
      if(lb>=0 && owners[i+j*nx]===own) anchored[lb]=1;
    }
    for(let k=0;k<nx*ny;k++){
      if(owners[k]!==null && !anchored[label[k]]){ owners[k]=null; occ[k]=0; }
    }
    return {nx, ny, minX, minY, cell, owners, occ, ownerAt: at};
  }

  return {ownerOf, buildSeeds, makeOwnerAt, computeGrid, POCKET};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = TERRITORY;
