(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.details-dialog').forEach(dialog => {
    if (typeof dialog.showModal !== 'function') return;
    let trigger;
    let closeTimer;
    let startedOutside = false;
    function close() {
      if (!dialog.open || dialog.hasAttribute('data-closing')) return;
      if (motion.matches) { dialog.close(); return; }
      dialog.setAttribute('data-closing', '');
      closeTimer = setTimeout(() => dialog.close(), 120);
    }
    function outside(event) {
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    }
    document.querySelectorAll(`[data-details="${dialog.id}"]`).forEach(link => {
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        trigger = link;
        clearTimeout(closeTimer);
        dialog.removeAttribute('data-closing');
        startedOutside = false;
        document.documentElement.classList.add('details-open');
        dialog.showModal();
        dialog.querySelector('.details-content').scrollTop = 0;
        dialog.querySelector('h2').focus({ preventScroll: true });
      });
    });
    dialog.querySelector('.details-close').addEventListener('click', close);
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
      const first = controls[0], last = controls.at(-1);
      if ((event.shiftKey && (document.activeElement === first || document.activeElement === dialog.querySelector('h2'))) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && outside(event); });
    dialog.addEventListener('click', event => {
      if (startedOutside && event.target === dialog && outside(event)) close();
      startedOutside = false;
    });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      dialog.removeAttribute('data-closing');
      document.documentElement.classList.remove('details-open');
      trigger?.focus({ preventScroll: true });
    });
  });
})();
