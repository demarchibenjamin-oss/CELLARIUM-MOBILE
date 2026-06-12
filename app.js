const KEY='cellarium-mobile-v6';
const $=id=>document.getElementById(id);
const qsa=s=>Array.from(document.querySelectorAll(s));

function seed(){
 return {
  bottles:[
   {wine:'Rayas',vintage:'2016',region:'Rhône',qty:3,value:780,destiny:'Une grande soirée entre amis',pantheon:true},
   {wine:'Yquem',vintage:'2001',region:'Sauternes',qty:1,value:520,destiny:'Une célébration familiale',pantheon:true},
   {wine:'Barolo Riserva',vintage:'2016',region:'Piémont',qty:2,value:160,destiny:'Mon meilleur ami',pantheon:false}
  ],
  tastings:[
   {wine:'Rayas 2016',date:'2026-02-14',context:'Dîner d’hiver à Lyon',contextType:'Amical',people:'Pierre, Antoine',mood:'Mélancolique puis apaisé',season:'Hiver',weather:'Froid sec, lumière douce',score:94,journal:'La pierre gardait encore la chaleur de l’été.',photo:null},
   {wine:'Yquem 2001',date:'2026-05-19',context:'Célébration familiale',contextType:'Familial',people:'Famille',mood:'Gratitude',season:'Printemps',weather:'Soir clair',score:97,journal:'Une douceur lumineuse, presque une mémoire d’enfance.',photo:null}
  ],
  traces:[
   {type:'Mémoire',title:'Pierre chaude',content:'Une impression de pierre chaude, de garrigue et de soir d’été.'},
   {type:'Philosophique',title:'Le temps',content:'Certaines choses ne gagnent de valeur qu’en vieillissant.'}
  ]
 }
}

function load(){let raw=localStorage.getItem(KEY);if(!raw){localStorage.setItem(KEY,JSON.stringify(seed()));raw=localStorage.getItem(KEY)}return JSON.parse(raw)}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));render()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

const titles={home:'Souvenir',cave:'La Cave',carnet:'Carnet',traces:'Traces',photos:'Photos',portrait:'Portrait',livre:'Livre Cellarium',addBottle:'Ajouter bouteille',addTasting:'Ajouter dégustation',addTrace:'Ajouter trace'};
function nav(id){
 qsa('.screen').forEach(s=>s.classList.add('hidden'));
 $(id).classList.remove('hidden');
 $('screenTitle').textContent=titles[id]||'Cellarium';
 qsa('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
 render();
}

function daysAgo(dateStr){
 const d=new Date(dateStr); if(isNaN(d)) return '';
 const diff=Math.round((Date.now()-d.getTime())/86400000);
 if(diff<0) return 'Dans le futur';
 if(diff===0) return 'Aujourd’hui';
 if(diff===1) return 'Hier';
 return `Il y a ${diff} jours`;
}

function render(){
 const d=load();
 const selected=todayMemory(d);
 $('dailyTitle').textContent=selected?.wine||selected?.title||'Aucun souvenir';
 $('dailyText').textContent=selected?.journal||selected?.content||'Ajoutez une trace.';
 $('dailyMeta').textContent=selected?.date ? `${selected.context||''} · ${daysAgo(selected.date)}` : 'Souvenir enregistré';

 const bottle=d.bottles[0];
 $('weeklyText').textContent=bottle?`${bottle.wine} ${bottle.vintage} — ${bottle.region}. Stock : ${bottle.qty}. ${bottle.destiny?'Destinée à : '+bottle.destiny:''}`:'Ajoutez une bouteille.';

 renderCave(d); renderCarnet(d); renderTraces(d); renderPhotos(d); renderPortrait(d); renderBook(d);
}

function todayMemory(d){
 if(d.tastings.length) return d.tastings[new Date().getDate()%d.tastings.length];
 if(d.traces.length) return d.traces[new Date().getDate()%d.traces.length];
 return null;
}

function renderCave(d){
 const term=($('search')?.value||'').toLowerCase();
 $('bottleList').innerHTML=d.bottles.filter(b=>(b.wine+b.region+b.vintage).toLowerCase().includes(term)).map(b=>`<article class="item"><h3>${esc(b.wine)} ${esc(b.vintage)}</h3><p>${esc(b.region)} · ${esc(b.qty)} bouteille(s)</p><p>${esc(b.destiny||'')}</p></article>`).join('');
}

function renderCarnet(d){
 $('tastingList').innerHTML=d.tastings.map(t=>`<article class="item">${t.photo?`<img src="${t.photo}" alt="">`:''}<h3>${esc(t.wine)}</h3><p>${esc(t.date)} · ${esc(t.context)}</p><p>${esc(t.contextType||'')} · ${esc(t.season||'')} · ${esc(t.weather||'')}</p><p>Avec : ${esc(t.people)}</p><p>État : ${esc(t.mood)}</p><p><b>${esc(t.score)}/100</b></p><p><i>“${esc(t.journal)}”</i></p></article>`).join('');
}

function renderTraces(d){
 $('traceList').innerHTML=d.traces.map(t=>`<article class="item"><span class="pill">${esc(t.type)}</span><h3>${esc(t.title)}</h3><p><i>“${esc(t.content)}”</i></p></article>`).join('');
}

function renderPhotos(d){
 const photos=d.tastings.filter(t=>t.photo).map(t=>t.photo);
 $('photoList').innerHTML=photos.length?photos.map(p=>`<img src="${p}" alt="">`).join(''):`<article class="card">Aucune photo pour l’instant. Ajoute une dégustation avec photo.</article>`;
}

function renderPortrait(d){
 const total=d.bottles.reduce((s,b)=>s+Number(b.qty||0),0);
 const value=d.bottles.reduce((s,b)=>s+Number(b.qty||0)*Number(b.value||0),0);
 const avg=Math.round(d.tastings.reduce((s,t)=>s+Number(t.score||0),0)/Math.max(d.tastings.length,1));
 const moods={}; d.tastings.forEach(t=>{if(t.mood)moods[t.mood]=(moods[t.mood]||0)+1});
 const topMood=Object.keys(moods)[0]||'Contemplatif';
 $('portraitContent').innerHTML=`<article class="portrait-card"><h3>${total}</h3><p>bouteilles</p></article><article class="portrait-card"><h3>${value.toLocaleString('fr-FR')} €</h3><p>valeur estimée</p></article><article class="portrait-card"><h3>${avg}/100</h3><p>note moyenne</p></article><article class="portrait-card"><h3>${esc(topMood)}</h3><p>tonalité dominante</p></article>`;
}

function renderBook(d){
 const year=new Date().getFullYear();
 const text=`Livre ${year} — ${d.tastings.length} dégustation(s), ${d.traces.length} trace(s), ${d.bottles.length} référence(s) en cave. Votre profil actuel : dégustateur contemplatif, attentif aux souvenirs, aux saisons et aux compagnons de dégustation.`;
 $('bookPreview').textContent=text;
 $('bookText').textContent=text;
}

function readPhoto(file){
 return new Promise(resolve=>{
  if(!file) return resolve(null);
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.readAsDataURL(file);
 });
}

function exportData(){
 const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a'); a.href=url; a.download='cellarium-v6-export.json'; a.click(); URL.revokeObjectURL(url);
}

function init(){
 $('enterBtn').onclick=()=>{$('welcome').classList.add('hidden');$('app').classList.remove('hidden');nav('home')};
 qsa('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
 $('search').oninput=render;
 $('exportBook').onclick=exportData;

 $('bottleForm').onsubmit=e=>{e.preventDefault();const d=load();d.bottles.unshift({wine:$('bWine').value,vintage:$('bVintage').value,region:$('bRegion').value,qty:Number($('bQty').value||1),value:Number($('bValue').value||0),destiny:$('bDestiny').value,pantheon:$('bPantheon').checked});save(d);e.target.reset();$('bQty').value=1;nav('cave')};

 $('tastingForm').onsubmit=async e=>{
  e.preventDefault();
  const photo=await readPhoto($('tPhoto').files[0]);
  const d=load();
  const t={wine:$('tWine').value,date:$('tDate').value,context:$('tContext').value,contextType:$('tContextType').value,people:$('tPeople').value,mood:$('tMood').value,season:$('tSeason').value,weather:$('tWeather').value,score:Number($('tScore').value||0),journal:$('tJournal').value,photo};
  d.tastings.unshift(t);
  if(t.journal)d.traces.unshift({type:'Mémoire',title:t.wine,content:t.journal});
  save(d); e.target.reset(); nav('carnet');
 };

 $('traceForm').onsubmit=e=>{e.preventDefault();const d=load();d.traces.unshift({type:$('trType').value,title:$('trTitle').value,content:$('trContent').value});save(d);e.target.reset();nav('traces')};
 render();
}
document.addEventListener('DOMContentLoaded',init);
