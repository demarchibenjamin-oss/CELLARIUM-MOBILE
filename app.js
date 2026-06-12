const KEY='cellarium-mobile-pwa-v1';
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
   {wine:'Rayas 2016',date:'2026-02-14',context:'Dîner d’hiver à Lyon',people:'Pierre, Antoine',mood:'Mélancolique puis apaisé',score:94,journal:'La pierre gardait encore la chaleur de l’été.'},
   {wine:'Yquem 2001',date:'2026-05-19',context:'Célébration familiale',people:'Famille',mood:'Gratitude',score:97,journal:'Une douceur lumineuse, presque une mémoire d’enfance.'}
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

const titles={home:'Souvenir du jour',cave:'La Cave',carnet:'Carnet',traces:'Traces',portrait:'Portrait',addBottle:'Ajouter bouteille',addTasting:'Ajouter dégustation',addTrace:'Ajouter trace'};
function nav(id){
 qsa('.screen').forEach(s=>s.classList.add('hidden'));
 $(id).classList.remove('hidden');
 $('screenTitle').textContent=titles[id]||'Cellarium';
 qsa('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
 render();
}

function render(){
 const d=load();
 const mem=d.traces[new Date().getDate()%d.traces.length]||d.traces[0];
 $('dailyTitle').textContent=mem?.title||'Aucun souvenir';
 $('dailyText').textContent=mem?.content||'Ajoutez une trace.';
 const bottle=d.bottles[0];
 $('weeklyText').textContent=bottle?`${bottle.wine} ${bottle.vintage} — ${bottle.region}. Stock : ${bottle.qty}. ${bottle.destiny?'Destinée à : '+bottle.destiny:''}`:'Ajoutez une bouteille.';

 const term=($('search')?.value||'').toLowerCase();
 $('bottleList').innerHTML=d.bottles.filter(b=>(b.wine+b.region+b.vintage).toLowerCase().includes(term)).map(b=>`<article class="item"><h3>${esc(b.wine)} ${esc(b.vintage)}</h3><p>${esc(b.region)} · ${esc(b.qty)} bouteille(s)</p><p>${esc(b.destiny||'')}</p></article>`).join('');

 $('tastingList').innerHTML=d.tastings.map(t=>`<article class="item"><h3>${esc(t.wine)}</h3><p>${esc(t.date)} · ${esc(t.context)}</p><p>Avec : ${esc(t.people)}</p><p>État : ${esc(t.mood)}</p><p><b>${esc(t.score)}/100</b></p><p><i>“${esc(t.journal)}”</i></p></article>`).join('');

 $('traceList').innerHTML=d.traces.map(t=>`<article class="item"><span class="pill">${esc(t.type)}</span><h3>${esc(t.title)}</h3><p><i>“${esc(t.content)}”</i></p></article>`).join('');

 const total=d.bottles.reduce((s,b)=>s+Number(b.qty||0),0);
 const value=d.bottles.reduce((s,b)=>s+Number(b.qty||0)*Number(b.value||0),0);
 const avg=Math.round(d.tastings.reduce((s,t)=>s+Number(t.score||0),0)/Math.max(d.tastings.length,1));
 $('portrait').innerHTML=`<article class="portrait-card"><h3>${total}</h3><p>bouteilles</p></article><article class="portrait-card"><h3>${value.toLocaleString('fr-FR')} €</h3><p>valeur estimée</p></article><article class="portrait-card"><h3>${avg}/100</h3><p>note moyenne</p></article><article class="portrait-card"><h3>Dégustateur contemplatif</h3><p>Sensible aux souvenirs, aux contextes et aux vins de caractère.</p></article>`;
}

function init(){
 $('enterBtn').onclick=()=>{$('welcome').classList.add('hidden');$('app').classList.remove('hidden');nav('home')};
 qsa('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
 $('search').oninput=render;

 $('bottleForm').onsubmit=e=>{e.preventDefault();const d=load();d.bottles.unshift({wine:$('bWine').value,vintage:$('bVintage').value,region:$('bRegion').value,qty:Number($('bQty').value||1),value:Number($('bValue').value||0),destiny:$('bDestiny').value,pantheon:$('bPantheon').checked});save(d);e.target.reset();$('bQty').value=1;nav('cave')};
 $('tastingForm').onsubmit=e=>{e.preventDefault();const d=load();const t={wine:$('tWine').value,date:$('tDate').value,context:$('tContext').value,people:$('tPeople').value,mood:$('tMood').value,score:Number($('tScore').value||0),journal:$('tJournal').value};d.tastings.unshift(t);if(t.journal)d.traces.unshift({type:'Mémoire',title:t.wine,content:t.journal});save(d);e.target.reset();nav('carnet')};
 $('traceForm').onsubmit=e=>{e.preventDefault();const d=load();d.traces.unshift({type:$('trType').value,title:$('trTitle').value,content:$('trContent').value});save(d);e.target.reset();nav('traces')};
 render();
}
document.addEventListener('DOMContentLoaded',init);
