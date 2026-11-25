(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Map();
  const animations = new Map();
  let wallTime = performance.now();
  let virtualTime = wallTime;
  let frameTime = wallTime;
  let scrollTime = -Infinity;
  let scrollPosition = window.scrollY;
  let velocity = 0;
  let rate = 1;
  let frame = 0;
  let nextTimer = 0;
  let displayedRate;

  // One monotonic clock keeps typed text, tool lifetimes and CSS reveals together.
  function now(timestamp = performance.now()) {
    if (timestamp > wallTime) {
      if (!document.hidden) virtualTime += (timestamp - wallTime) * rate;
      wallTime = timestamp;
    }
    return virtualTime;
  }
  function publishRate() {
    const value = rate.toFixed(2);
    if (value === displayedRate) return;
    displayedRate = value;
    document.documentElement.dataset.animationRate = value;
  }
  function wake() {
    if (frame || document.hidden) return;
    frameTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function tick(timestamp) {
    frame = 0;
    const elapsed = Math.max(0, timestamp - frameTime);
    frameTime = timestamp;
    now(timestamp);
    const speed = velocity * Math.exp(-Math.max(0, timestamp - scrollTime - 60) / 140);
    const target = motion.matches ? 1 : 1 + 1.5 * Math.min(1, Math.max(0, (speed - 350) / 1400));
    const response = target > rate ? 90 : 220;
    rate += (target - rate) * (1 - Math.exp(-elapsed / response));
    if (target === 1 && rate < 1.005) rate = 1;
    publishRate();
    for (const [id, timer] of [...timers]) {
      if (timer.at > virtualTime || !timers.has(id)) continue;
      timers.delete(id);
      timer.callback();
    }
    for (const [animation, appliedRate] of animations) {
      if (animation.playState !== 'running') {
        animations.delete(animation);
      } else if (Math.abs(appliedRate - rate) > .005) {
        animation.updatePlaybackRate(rate);
        animations.set(animation, rate);
      }
    }
    if (timers.size || animations.size || rate > 1 || target > 1) {
      frame = frame || requestAnimationFrame(tick);
    }
  }
  function track(animation) {
    if (!animation || motion.matches || animations.has(animation) || typeof animation.updatePlaybackRate !== 'function') return;
    // Leave ambient loops, transitions and scroll-position-driven travel alone.
    if (animation.transitionProperty || (animation.timeline && animation.timeline !== document.timeline)) return;
    if (!Number.isFinite(animation.effect?.getComputedTiming().activeDuration)) return;
    if (animation.playState !== 'running') return;
    animation.updatePlaybackRate(rate);
    animations.set(animation, rate);
    wake();
  }
  function trackTree(root) {
    if (motion.matches || typeof root?.getAnimations !== 'function') return;
    requestAnimationFrame(() => root.getAnimations({ subtree: true }).forEach(track));
  }
  function schedule(callback, delay) {
    const id = ++nextTimer;
    timers.set(id, { callback, at: now() + Math.max(0, delay) });
    wake();
    return id;
  }
  function reset() {
    now();
    rate = 1;
    velocity = 0;
    scrollPosition = window.scrollY;
    animations.forEach((_, animation) => animation.updatePlaybackRate(1));
    publishRate();
  }
  window.scrollMotion = { now, track, trackTree, setTimeout: schedule, clearTimeout: id => timers.delete(id) };
  publishRate();
  window.addEventListener('scroll', () => {
    const position = window.scrollY;
    const distance = Math.abs(position - scrollPosition);
    scrollPosition = position;
    if (motion.matches || document.hidden || distance === 0) return;
    const timestamp = performance.now();
    const elapsed = Math.max(16, Math.min(100, timestamp - scrollTime));
    velocity = Math.min(5000, distance / elapsed * 1000);
    scrollTime = timestamp;
    wake();
  }, { passive: true });
  motion.addEventListener('change', () => { reset(); wake(); });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    // A background tab should not skip the rest of a conversation on return.
    wallTime = performance.now();
    reset();
    if (!document.hidden) wake();
  });
})();
