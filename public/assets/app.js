document.documentElement.classList.add('js');
let copyTimer;
function closeMenu(returnFocus=false){
  const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
  toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');if(returnFocus)toggle?.focus();
}
document.addEventListener('click',async event=>{
  const toggle=event.target.closest('.menu-toggle');
  if(toggle){const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('#main-nav')?.classList.toggle('is-open',open);}
  else if(!event.target.closest('.site-header')||event.target.closest('#main-nav a'))closeMenu();
  const button=event.target.closest('[data-copy]');
  if(button){
    const status=document.querySelector('#copy-status');
    try{await navigator.clipboard.writeText(button.dataset.copy);status.textContent=`已复制「${button.dataset.copy}」，可前往小红书搜索。`;}
    catch{status.textContent=`请手动复制账号名称：${button.dataset.copy}`;}
    clearTimeout(copyTimer);copyTimer=setTimeout(()=>{if(status.isConnected)status.textContent='';},6000);
  }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='true')closeMenu(true);});
matchMedia('(min-width: 701px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
function initPage(){
  const search=document.querySelector('#project-search');if(!search)return;
  const buttons=[...document.querySelectorAll('[data-filter]')],rows=[...document.querySelectorAll('.archive-row')];
  const categories=buttons.map(b=>b.dataset.filter),params=new URLSearchParams(location.search);
  let category=categories.includes(params.get('category'))?params.get('category'):'All';search.value=params.get('q')||'';
  function filter(updateURL=true){
    const query=search.value.trim().toLocaleLowerCase();let count=0;
    for(const row of rows){const matches=(category==='All'||row.dataset.category.split(' ').includes(category))&&row.dataset.search.includes(query);row.hidden=!matches;if(matches)count++;}
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter===category));
    document.querySelector('.result-count').textContent=`${count} 个项目${category==='All'?'':` / ${category}`}`;
    document.querySelector('.empty-state').hidden=count!==0;
    if(updateURL){const next=new URL(location.href);category==='All'?next.searchParams.delete('category'):next.searchParams.set('category',category);query?next.searchParams.set('q',search.value.trim()):next.searchParams.delete('q');history.replaceState(history.state,'',next);}
    document.dispatchEvent(new Event('portfolio:layout'));
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;filter();}));
  search.addEventListener('input',()=>filter());
  document.querySelector('#reset-filters').addEventListener('click',()=>{category='All';search.value='';filter();search.focus();});filter(false);
}
initPage();document.addEventListener('portfolio:page',initPage);
import('./motion.js').catch(()=>{/* Static navigation and all content remain usable. */});
