(() => {
  const section = document.querySelector('.watch-alerts');
  if (!section) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const schedule = window.scrollMotion?.setTimeout || setTimeout;
  const cancel = window.scrollMotion?.clearTimeout || clearTimeout;
  const clock = section.querySelector('.watch-clock');
  const chatClock = section.querySelector('.watch-chat-clock');
  const conversation = section.querySelector('.watch-conversation-scroll');
  const messages = [...section.querySelectorAll('.watch-reply[data-watch-reveal]')];
  const notifications = [...section.querySelectorAll('.watch-notification')];
  const replay = section.querySelector('.watch-replay');
  let timers = [];
  let started = false;
  let followLatest = true;
  function clear() {
    timers.forEach(cancel);
    timers = [];
  }
  function step(value) {
    section.dataset.watchStep = String(value);
    const hour = 14 + Math.floor(value / 2);
    clock.textContent = chatClock.textContent = `${hour}:00`;
    let addedMessage = false;
    messages.forEach(message => {
      const visible = Number(message.dataset.watchReveal) <= value;
      if (message.hidden && visible) addedMessage = true;
      message.hidden = !visible;
    });
    const delivered = notifications.filter(item => Number(item.dataset.watchReveal) <= value);
    notifications.forEach(item => {
      item.hidden = !delivered.includes(item);
      const age = delivered.length - 1 - delivered.indexOf(item);
      item.dataset.watchPast = String(age > 0);
      item.querySelector('time').textContent = age > 0 ? `${age}h ago` : 'now';
    });
    if (value === 0) {
      followLatest = true;
      conversation.scrollTop = 0;
    } else if (addedMessage && followLatest) {
      conversation.scrollTo({ top: conversation.scrollHeight, behavior: motion.matches ? 'instant' : 'smooth' });
    }
    window.scrollMotion?.trackTree(section);
  }
  function play() {
    clear();
    started = true;
    if (motion.matches) { step(7); return; }
    step(0);
    timers = [600, 2300, 3600, 6100, 7400, 10300, 11600].map((delay, index) => schedule(() => step(index + 1), delay));
  }
  conversation.addEventListener('scroll', () => {
    followLatest = conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 24;
  }, { passive: true });
  section.dataset.watchReady = 'true';
  step(motion.matches ? 7 : 0);
  replay.hidden = false;
  replay.addEventListener('click', play);
  motion.addEventListener('change', () => {
    if (motion.matches) { clear(); step(7); }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      if (!started) play();
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(section.querySelector('.watch-conversation'));
  } else play();
})();
