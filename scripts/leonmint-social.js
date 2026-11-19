(() => {
  const url = 'https://x.com/leonmintpad';
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.299l13.312 17.403Z"/></svg>';
  const ensure = () => {
    for (const header of document.querySelectorAll('header.sx-bar')) {
      if (header.querySelector('.lm-x-button')) continue;
      const link = document.createElement('a');
      link.className = 'lm-x-button';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Leonmint on X');
      link.innerHTML = icon;
      header.append(link);
    }
  };
  const start = () => {
    ensure();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; ensure(); });
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'complete') setTimeout(start, 200);
  else window.addEventListener('load', () => setTimeout(start, 200), { once: true });
})();
