(() => {
  const form=document.querySelector('#discovery-form');
  const openButton=document.querySelector('.filter-open');
  if(!form||!openButton||!window.HTMLDialogElement)return;
  const host=form.parentElement;
  const mobile=matchMedia('(max-width:700px)');
  const dialog=document.createElement('dialog');
  dialog.className='filter-dialog';dialog.id='discovery-filter-dialog';
  openButton.setAttribute('aria-haspopup','dialog');openButton.setAttribute('aria-controls',dialog.id);openButton.setAttribute('aria-expanded','false');
  dialog.setAttribute('aria-labelledby','filter-title');
  dialog.innerHTML='<div class="filter-dialog-heading"><h2 id="filter-title">Bộ lọc</h2><button type="button" class="filter-close" aria-label="Đóng bộ lọc">Đóng</button></div><div class="filter-dialog-body"></div>';
  document.body.append(dialog);
  const body=dialog.querySelector('.filter-dialog-body');
  const closeButton=dialog.querySelector('.filter-close');
  const clearButton=form.querySelector('[data-clear-draft]');
  document.documentElement.classList.add('finder-ready');
  function resetBusy(){
    document.querySelectorAll('.discovery-filter-form,.discovery-sort').forEach(f=>{
      f.removeAttribute('aria-busy');
      const button=f.querySelector('[type=submit]');
      if(button&&button.dataset.label){button.textContent=button.dataset.label;button.disabled=false;}
    });
  }
  function resetDraft(){form.reset();}
  function restore(){
    openButton.setAttribute('aria-expanded','false');
    resetDraft();
    if(form.parentElement!==host)host.append(form);
    if(dialog.open)dialog.close();
    if(mobile.matches)openButton.focus();
  }
  function removeMarker(){
    const state={...(history.state||{})};delete state.vibelabFilter;history.replaceState(state,'');
  }
  function cancel(){
    if(history.state?.vibelabFilter)history.back();else restore();
  }
  function configure(){
    openButton.hidden=!mobile.matches;
    if(!mobile.matches&&dialog.open){removeMarker();restore();}
  }
  openButton.addEventListener('click',()=>{
    resetDraft();body.append(form);dialog.showModal();openButton.setAttribute('aria-expanded','true');closeButton.focus();
    history.pushState({...history.state,vibelabFilter:true},'',location.href);
  });
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const nodes=[...dialog.querySelectorAll('button,input,select,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length);
    const first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  closeButton.addEventListener('click',cancel);
  dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
  dialog.addEventListener('click',event=>{
    const r=dialog.getBoundingClientRect();
    if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))cancel();
  });
  addEventListener('popstate',()=>{if(dialog.open)restore();});
  clearButton.hidden=false;
  clearButton.addEventListener('click',()=>{
    form.querySelectorAll('input[type=checkbox]').forEach(n=>{n.checked=false;});
    form.querySelector('select[name=category]').value='';
  });
  document.querySelectorAll('.discovery-filter-form,.discovery-sort').forEach(f=>{
    f.addEventListener('submit',event=>{
      const params=new URLSearchParams(new FormData(f));
      const button=f.querySelector('[type=submit]');
      f.setAttribute('aria-busy','true');
      button.dataset.label=button.textContent;button.textContent='Đang áp dụng…';button.disabled=true;
      if(dialog.open){
        event.preventDefault();
        location.replace(f.action+'?'+params.toString());
      }
    });
  });
  mobile.addEventListener('change',configure);
  addEventListener('pageshow',()=>{
    if(dialog.open)restore();
    if(history.state?.vibelabFilter)removeMarker();
    const applied=()=>{
      resetDraft();
      document.querySelector('.discovery-sort')?.reset();
      document.querySelector('.header-search')?.reset();
      resetBusy();configure();
    };
    applied();
    // Browsers can restore persisted controls after pageshow in history navigation.
    setTimeout(applied,0);
  });
  configure();
})();
