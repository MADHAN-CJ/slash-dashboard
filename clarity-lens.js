(() => {
  const section = document.querySelector('.benchmark-section');
  if (!section) return;
  const lens = section.querySelector('.clarity-lens');
  const video = lens.querySelector('video');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let entrancePending = true;
  let renderer, sourceLoading = false;

  if (!motion.matches) section.dataset.lensReveal = 'ready';

  function updatePlayback() {
    if (!video) return;
    if (!inView || document.hidden || motion.matches) {
      video.pause();
      renderer?.stop();
      return;
    }
    if (!video.getAttribute('src')) {
      renderer ??= window.createLensDither?.(lens, video, () => {
        renderer = null;
        video.src = video.dataset.fallbackSrc;
        lens.dataset.videoFallback = 'true';
        updatePlayback();
      });
      if (renderer && window.location?.protocol === 'file:') {
        if (sourceLoading) return;
        sourceLoading = true;
        const script = document.createElement('script');
        script.onload = () => {
          video.src = window.marketsLensVideoSource;
          delete window.marketsLensVideoSource;
          script.remove();
          updatePlayback();
        };
        script.onerror = () => {
          renderer?.dispose(); renderer = null;
          video.src = video.dataset.fallbackSrc;
          lens.dataset.videoFallback = 'true';
          script.remove(); updatePlayback();
        };
        script.src = video.dataset.fileSrc;
        document.head.append(script);
        return;
      }
      video.src = renderer ? video.dataset.src : (video.dataset.fallbackSrc || video.dataset.src);
      if (!renderer) lens.dataset.videoFallback = 'true';
    }
    video.muted = true;
    video.play().catch(() => {});
  }

  if (video) {
    video.addEventListener('playing', () => {
      lens.dataset.videoReady = 'true';
      if (inView && !document.hidden && !motion.matches) {
        renderer?.start(entrancePending);
        entrancePending = false;
      }
    });
    video.addEventListener('error', () => { delete lens.dataset.videoReady; renderer?.stop(); });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible && !inView) entrancePending = true;
      inView = visible;
      if (inView) section.dataset.lensReveal = 'focused';
      updatePlayback();
    }, { threshold: .15 });
    observer.observe(lens);
  } else {
    section.dataset.lensReveal = 'focused';
    inView = true;
    updatePlayback();
  }

  motion.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
})();
