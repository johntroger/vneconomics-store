(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!button || !nav) return;
  const mobile = matchMedia('(max-width:700px)');
  const setOpen = open => {
    button.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  };
  button.addEventListener('click', () => setOpen(nav.dataset.open !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && nav.dataset.open === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!mobile.matches || !link) return;
    setOpen(false);
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      let id; try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (target) {
        target.tabIndex = -1;
        target.focus({preventScroll: true});
      }
    }
  });
  mobile.addEventListener('change', () => {
    const wasInNav = nav.contains(document.activeElement);
    setOpen(false);
    if (mobile.matches && wasInNav) button.focus();
  });
  document.documentElement.classList.add('js');
})();
