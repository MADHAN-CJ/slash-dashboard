(() => {
  const studio = document.querySelector('.tool-studio');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (studio) {
    const buttons = [...studio.querySelectorAll('[data-tool-idea]')];
    const callout = studio.querySelector('#studio-callout');
    const prompt = studio.querySelector('#studio-prompt');
    let active = null;
    let closeTimer;
    function hide() {
      clearTimeout(closeTimer);
      callout.hidden = true;
      if (active) {
        active.setAttribute('aria-expanded', 'false');
        active.removeAttribute('aria-describedby');
      }
      active = null;
    }
    function preview(button) {
      clearTimeout(closeTimer);
      if (active && active !== button) hide();
      active = button;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-describedby', 'studio-callout');
      prompt.textContent = button.dataset.prompt;
      callout.hidden = false;
      const tile = button.getBoundingClientRect();
      const box = callout.getBoundingClientRect();
      const center = tile.left + tile.width / 2;
      const left = Math.max(16, Math.min(center - box.width / 2, window.innerWidth - box.width - 16));
      callout.dataset.side = 'above';
      callout.style.left = `${left}px`;
      callout.style.top = `${Math.max(12, tile.top - box.height - 20)}px`;
      callout.style.setProperty('--callout-anchor', `${Math.max(20, Math.min(center - left, box.width - 20))}px`);
    }
    const scheduleHide = () => { closeTimer = setTimeout(hide, 120); };
    buttons.forEach(button => {
      button.addEventListener('pointerenter', () => preview(button));
      button.addEventListener('focus', () => preview(button));
      button.addEventListener('click', () => preview(button));
      button.addEventListener('pointerleave', scheduleHide);
      button.addEventListener('blur', scheduleHide);
    });
    callout.addEventListener('pointerenter', () => clearTimeout(closeTimer));
    callout.addEventListener('pointerleave', scheduleHide);
    document.addEventListener('pointerdown', event => {
      if (!event.target.closest('[data-tool-idea], .studio-callout')) hide();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true, capture: true });
    window.addEventListener('resize', hide);
    if ('IntersectionObserver' in window && !motion.matches) {
      studio.dataset.tileReveal = 'pending';
      const reveal = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        studio.dataset.tileReveal = 'true';
        reveal.disconnect();
      }, { threshold: .12 });
      reveal.observe(studio.querySelector('.studio-tile-stage'));
    }
  }

  const visual = document.querySelector('.savings-visual');
  const video = visual?.querySelector('video');
  if (!video) return;
  let inView = false;
  let failed = false;
  let renderer;
  let entrancePending = true;
  function update() {
    if (!inView || document.hidden || motion.matches || failed) {
      video.pause();
      renderer?.stop();
      return;
    }
    if (!video.getAttribute('src')) {
      renderer = window.createLensDither?.(visual, video, () => { renderer = null; }, { keepLensClear: false, fadeTop: true });
      video.src = video.dataset.src;
    }
    video.muted = true;
    video.play().catch(error => {
      if (error?.name === 'AbortError' || !inView || document.hidden || motion.matches || failed) return;
      failed = true;
      renderer?.stop();
      delete visual.dataset.videoReady;
    });
  }
  video.addEventListener('playing', () => {
    visual.dataset.videoReady = 'true';
    if (inView && !document.hidden && !motion.matches) {
      renderer?.start(entrancePending);
      entrancePending = false;
    }
  });
  video.addEventListener('error', () => {
    failed = true;
    delete visual.dataset.videoReady;
    update();
  });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible && !inView) entrancePending = true;
      inView = visible;
      update();
    }, { threshold: .15 });
    visibility.observe(visual);
  } else {
    inView = true;
    update();
  }
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
