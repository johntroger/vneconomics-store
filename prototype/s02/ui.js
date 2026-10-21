const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#main-nav');
function closeMenu(){navigation?.removeAttribute('data-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));navigation.toggleAttribute('data-open',!open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const filterForm=document.querySelector('#catalog-filters');
if(filterForm){
 const query=document.querySelector('#catalog-query'),type=document.querySelector('#catalog-type');
 const cards=[...document.querySelectorAll('[data-resource]')],allowedTypes=['','learn','starter','skill','tool'];
 function render(updateURL=false){
  const chosenType=allowedTypes.includes(type.value)?type.value:'';
  const terms=normalize(query.value.trim()).split(/\s+/).filter(Boolean);
  let count=0;
  for(const card of cards){const matches=(!chosenType||card.dataset.type===chosenType)&&terms.every(term=>normalize(card.dataset.name).includes(term));card.hidden=!matches;if(matches)count++;}
  document.querySelector('#result-count').textContent=`${count} tài nguyên trong bản mẫu`;
  document.querySelector('#empty-state').hidden=count!==0;
  if(updateURL){const url=new URL(location.href);url.search='';if(query.value.trim())url.searchParams.set('q',query.value.trim());if(chosenType)url.searchParams.set('type',chosenType);history.pushState({},'',url);}
 }
 function fromURL(){const params=new URLSearchParams(location.search);query.value=params.get('q')||'';type.value=allowedTypes.includes(params.get('type'))?params.get('type'):'';render();}
 filterForm.addEventListener('submit',event=>{event.preventDefault();render(true);});
 document.querySelector('#reset-filters').addEventListener('click',()=>{query.value='';type.value='';render(true);});
 window.addEventListener('popstate',fromURL);fromURL();
}
const copy=document.querySelector('#copy-prompt');
copy?.addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(document.querySelector('#lesson-prompt').textContent);status.textContent='Đã sao chép brief. Đọc lại trước khi gửi cho Codex.';}catch{status.textContent='Chưa sao chép được. Hãy chọn nội dung brief rồi nhấn Ctrl+C.';}});
const checks=[...document.querySelectorAll('.lesson-checklist input')];
for(const check of checks)check.addEventListener('change',()=>{document.querySelector('#check-progress').textContent=`${checks.filter(c=>c.checked).length}/5 mục bạn tự đánh dấu`;});
