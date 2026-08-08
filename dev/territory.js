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
  const VOID_SPACING = 11;    // world units between void seeds
  const VOID_CLEARANCE = 9.5; // no void seed this close to any system
  const VOID_JITTER = 4.2;    // deterministic wobble so borders look organic
  const POCKET = 5.6;         // guaranteed neutral radius around unclaimed systems

  /* the ONE ownership resolver — first match wins */
  function ownerOf(s, style){
    if(s.aff === 'UNC') return null;                       // (a) unclaimed space
    if(s.lost) return style === 'claim' ? 'UEE' : 'VNCL';  // (b) occupied UEE claims
    if(s.fca) return 'UEE';                                // (c) FCA: UEE-administered
    if(s.aff === 'DEV') return null;                       // (d) developing, not FCA
    return s.aff;                                          // (e) own affiliation
  }

  function buildSeeds(systems, style){
    const seeds = systems.map(s => ({x: s.x, y: s.y, owner: ownerOf(s, style), sys: s}));
    let minX=1e9, maxX=-1e9, minY=1e9, maxY=-1e9;
    systems.forEach(s=>{minX=Math.min(minX,s.x); maxX=Math.max(maxX,s.x);
                        minY=Math.min(minY,s.y); maxY=Math.max(maxY,s.y);});
    let rs=1337; const rnd=()=>{rs=(rs*16807)%2147483647; return rs/2147483647;};
    for(let gy=minY-VOID_SPACING*2; gy<=maxY+VOID_SPACING*2; gy+=VOID_SPACING){
      for(let gx=minX-VOID_SPACING*2; gx<=maxX+VOID_SPACING*2; gx+=VOID_SPACING){
        const x=gx+(rnd()-0.5)*2*VOID_JITTER, y=gy+(rnd()-0.5)*2*VOID_JITTER;
        let clear=true;
        for(const s of systems){
          const dx=s.x-x, dy=s.y-y;
          if(dx*dx+dy*dy < VOID_CLEARANCE*VOID_CLEARANCE){ clear=false; break; }
        }
        if(clear) seeds.push({x, y, owner: null, sys: null});
      }
    }
    return seeds;
  }

  /* nearest-seed lookup; returns the winning seed (owner + backing system) */
  function makeOwnerAt(systems, style){
    const seeds = buildSeeds(systems, style);
    return function(x, y){
      let best=null, bd=Infinity;
      for(const sd of seeds){
        let d = Math.hypot(sd.x-x, sd.y-y);
        if(sd.sys && sd.owner===null) d = Math.max(0, d-POCKET);
        if(d<bd){ bd=d; best=sd; }
      }
      return best;
    };
  }

  return {ownerOf, buildSeeds, makeOwnerAt, POCKET};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = TERRITORY;
