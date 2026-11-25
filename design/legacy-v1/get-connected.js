(() => {
  const section = document.querySelector('.get-connected');
  if (!section) return;
  const tabs = [...section.querySelectorAll('[data-setup-platform]')];
  const panels = [...section.querySelectorAll('[data-setup-panel]')];
  function select(tab, focus = false) {
    const platform = tab.dataset.setupPlatform;
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.setupPanel !== platform; });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
})();
