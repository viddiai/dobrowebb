(() => {
 'use strict';
 const root = document.documentElement;
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 let keyboard = false;
 const clearEntrances = () => document.querySelectorAll('.image-entrance').forEach(el => el.classList.remove('image-entrance'));
 document.addEventListener('keydown', () => { keyboard = true; root.classList.add('keyboard-mode'); clearEntrances(); }, true);
 document.addEventListener('pointerdown', () => { keyboard = false; root.classList.remove('keyboard-mode'); }, true);
 // Content is visible by default: no pre-hidden sections and no dependency on an observer firing.
 if ('IntersectionObserver' in window && !reduced.matches) {
  const selector = '.heromedia, .card .photo, .case-card img, .project-wide > img, .roof-detail figure img, .process .num';
  const observer = new IntersectionObserver(entries => {
   entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
    const el = entry.target;
    observer.unobserve(el);
    if (reduced.matches || keyboard || document.hidden || el.contains(document.activeElement)) return;
    if (el.matches('.process .num')) el.classList.add('step-arrived');
    el.style.setProperty('--image-delay', `${Math.min(index, 3) * 50}ms`);
    el.classList.add('image-entrance');
    const finish = () => { el.classList.remove('image-entrance'); el.style.removeProperty('--image-delay'); };
    el.addEventListener('animationend', finish, {once:true});
    // A cancelled animation or a tab change must never leave an image faded out.
    window.setTimeout(finish, 600);
   });
  }, {threshold:0.12});
  document.querySelectorAll(selector).forEach(el => { if (!el.closest('#project-grid')) observer.observe(el); });
  reduced.addEventListener('change', () => { if (reduced.matches) { observer.disconnect(); clearEntrances(); } });
 }

 // Show the existing 'email prepared' message gently; never imply an email was sent.
 const status=document.querySelector('#form-status');
 if(status&&'MutationObserver' in window){
  let feedback=null;
  const cancelFeedback=()=>{if(feedback){feedback.cancel();feedback=null;}};
  new MutationObserver(()=>{
   cancelFeedback();
   if(!status.textContent.trim()||reduced.matches||keyboard||document.hidden||typeof status.animate!=='function')return;
   feedback=status.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(0.23,1,0.32,1)'});
  }).observe(status,{childList:true,subtree:true,characterData:true});
  reduced.addEventListener('change',cancelFeedback);
  document.addEventListener('keydown',cancelFeedback);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelFeedback();});
 }

 const states = new Map();
 function settle(details, state) {
  window.clearTimeout(state.timer); window.cancelAnimationFrame(state.frame);
  details.open = state.open;
  details.classList.remove('faq-motion');
  details.removeAttribute('data-closing');
  details.style.removeProperty('height');
  state.summary.removeAttribute('aria-expanded');
  details.querySelectorAll('p').forEach(p => { p.inert = false; });
  states.delete(details);
 }
 document.querySelectorAll('.faq details').forEach(details => {
  const summary = details.querySelector('summary');
  if (!summary) return;
  summary.addEventListener('click', event => {
   event.preventDefault();
   const previous = states.get(details);
   const open = !(previous ? previous.open : details.open);
   const state = {open,summary,timer:0,frame:0};
   if (previous) { window.clearTimeout(previous.timer); window.cancelAnimationFrame(previous.frame); }
   if (reduced.matches || keyboard || event.detail === 0) { settle(details,state); return; }
   // Read the current presentation height so a rapid second tap reverses from this position.
   const start = details.getBoundingClientRect().height;
   details.classList.remove('faq-motion');
   details.style.height = 'auto';
   details.open = true;
   const style = getComputedStyle(details);
   const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
   const end = open ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + padding;
   details.style.height = `${start}px`;
   details.classList.add('faq-motion');
   summary.setAttribute('aria-expanded',String(open));
   details.toggleAttribute('data-closing', !open);
   details.querySelectorAll('p').forEach(p => { p.inert = !open; });
   states.set(details,state);
   void details.offsetHeight;
   state.frame = window.requestAnimationFrame(() => {
    details.style.height = `${end}px`;
    state.timer = window.setTimeout(() => { if (states.get(details) === state) settle(details,state); }, 220);
   });
  });
 });
 // Finish an active accordion cleanly if viewport/font sizing or motion preferences change.
 const settleAll = () => Array.from(states).forEach(([details,state]) => settle(details,state));
 window.addEventListener('resize',settleAll,{passive:true});
 reduced.addEventListener('change',settleAll);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearEntrances();settleAll();}});
})();
