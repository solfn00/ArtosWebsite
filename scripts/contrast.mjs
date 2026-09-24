// WCAG contrast for the palette pairs we actually use.
const hex = (h) => h.replace('#','').match(/../g).map(x=>parseInt(x,16));
const lin = (c) => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4 };
const L = (h) => { const [r,g,b]=hex(h); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b) };
const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05) };
const P = { navy:'#052754', turq:'#5de2e7', sand:'#f1e8d8', cream:'#fbf6ec', card:'#fffdf8',
            clay:'#9c4726', ink:'#10182b', muted:'#5d6472',
            mutedDark:'#c9cdd6', faintDark:'#a7adba', stone:'#dccaa9' };
const pairs = [
  ['ink','cream'],['ink','sand'],['ink','card'],['muted','cream'],['muted','sand'],['muted','card'],
['clay','cream'],['clay','sand'],['clay','card'],
  ['navy','sand'],['navy','cream'],['navy','card'],['navy','turq'],
  ['cream','navy'],['turq','navy'],['mutedDark','navy'],['faintDark','navy'],['stone','navy'],
];
for (const [fg,bg] of pairs) {
  const r = ratio(P[fg],P[bg]);
  console.log(`${(fg+' on '+bg).padEnd(22)} ${r.toFixed(2)}:1  ${r>=4.5?'AA':r>=3?'large-only':'FAIL'}`);
}
