const menu=document.querySelector('.menu');
const nav=document.querySelector('.navlinks');
function setMenu(open,restoreFocus=false){
 if(!menu||!nav)return;
 menu.setAttribute('aria-expanded',String(open));
 menu.setAttribute('aria-label',open?'Stäng huvudmenyn':'Öppna huvudmenyn');
 menu.textContent=open?'Stäng':'Meny';
 nav.classList.toggle('open',open);
 nav.inert=window.matchMedia('(max-width:1100px)').matches&&!open;
 if(!open)nav.querySelectorAll('details[open]').forEach(d=>d.open=false);
 if(restoreFocus)menu.focus();
}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&nav?.classList.contains('open')){e.preventDefault();setMenu(false,true);}
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target))setMenu(false)});
const mobileNavigation=window.matchMedia('(max-width:1100px)');
mobileNavigation.addEventListener('change',()=>setMenu(false));
nav?.addEventListener('focusout',e=>{if(mobileNavigation.matches&&e.relatedTarget&&!nav.contains(e.relatedTarget)&&e.relatedTarget!==menu)setMenu(false)});
document.querySelector('#request-form')?.addEventListener('submit',e=>{e.preventDefault();const {email,phone}=e.currentTarget.dataset;const f=new FormData(e.currentTarget);const body=`Hej Dobro!\n\nJag vill boka ett kostnadsfritt hembesök.\n\nProjekt: ${f.get('project')}\nNamn: ${f.get('name')}\nTelefon: ${f.get('phone')}\n\n${f.get('description')||''}`;const url=`mailto:${email}?subject=${encodeURIComponent('Förfrågan: '+f.get('project'))}&body=${encodeURIComponent(body)}`;window.location.href=url;const status=document.getElementById('form-status');status.replaceChildren(document.createTextNode('Din förfrågan är förberedd. Skicka mejlet i ditt e-postprogram. Om inget öppnas kan du '));const a=document.createElement('a');a.href=url;a.textContent='öppna e-postutkastet igen';a.style.textDecoration='underline';status.append(a,document.createTextNode(` eller ringa ${phone}. Inget har skickats från webbsidan.`));});
const projectAnimations = new Map();
function stopProjectMotion(){
 projectAnimations.forEach(animation=>animation.cancel());
 projectAnimations.clear();
}
const filterReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
filterReduced.addEventListener('change',stopProjectMotion);
window.addEventListener('resize',stopProjectMotion,{passive:true});
document.addEventListener('keydown',stopProjectMotion);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',event=>{
 if(button.getAttribute('aria-pressed')==='true')return;
 const cards=Array.from(document.querySelectorAll('#project-grid [data-category]'));
 // Snapshot the live, possibly moving positions before cancelling an interrupted filter.
 const before=new Map(cards.filter(card=>!card.hidden).map(card=>[card,card.getBoundingClientRect()]));
 stopProjectMotion();
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 cards.forEach(card=>card.hidden=button.dataset.filter!=='Alla'&&card.dataset.category!==button.dataset.filter);
 if(filterReduced.matches||event.detail===0||document.documentElement.classList.contains('keyboard-mode'))return;
 cards.filter(card=>!card.hidden).forEach(card=>{
  if(typeof card.animate!=='function')return;
  const from=before.get(card),to=card.getBoundingClientRect();
  const frames=from?
   [{transform:`translate(${from.left-to.left}px,${from.top-to.top}px)`},{transform:'translate(0,0)'}]:
   [{opacity:0,transform:'scale(0.97)'},{opacity:1,transform:'scale(1)'}];
  if(from&&Math.abs(from.left-to.left)<1&&Math.abs(from.top-to.top)<1)return;
  const animation=card.animate(frames,{duration:200,easing:'cubic-bezier(0.23,1,0.32,1)'});
  projectAnimations.set(card,animation);
  animation.finished.then(()=>{if(projectAnimations.get(card)===animation)projectAnimations.delete(card)},()=>{});
 });
}));document.addEventListener('click',e=>{document.querySelectorAll('.nav-dropdown[open]').forEach(d=>{if(!d.contains(e.target))d.open=false})});document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.nav-dropdown[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus()})});

setMenu(false);
