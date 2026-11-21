'use strict';

(() => {
  const screen = document.getElementById('quick-start');
  const game = document.getElementById('game');
  const choices = document.getElementById('start-countries');
  const status = document.getElementById('start-status');
  const close = document.getElementById('close-start');
  const action = document.getElementById('action');
  const files = [
    'asset/vendor/three.min.js', 'asset/vendor/d3.min.js', 'asset/world.js', 'asset/models.js',
    'asset/ui/market-routes.js', 'asset/ui/scene.js', 'asset/ui/game.js?v=2'
  ];
  const requests = new Map();
  let selectMarket;

  function loadScripts() {
    return Promise.all(files.map(src => {
      if (!requests.has(src)) {
        const script = document.createElement('script');
        script.async = false;
        script.src = src;
        requests.set(src, new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => {
            requests.delete(src);
            script.remove();
            reject(new Error('Could not load ' + src));
          };
        }));
        document.head.append(script);
      }
      return requests.get(src);
    }));
  }

  function showStart() {
    status.textContent = '';
    close.disabled = false;
    for (const button of choices.children) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
    if (!screen.open) screen.showModal();
  }

  function initGame() {
    if (selectMarket) return;
    selectMarket = createGame(showStart);
    delete game.dataset.preview;
    document.getElementById('stage').inert = false;
    for (const id of ['navigate', 'upgrades', 'game-speed']) document.getElementById(id).disabled = false;
    action.removeEventListener('click', showStart);
  }

  async function dismissStart() {
    if (close.disabled) return;
    screen.close();
    action.focus({ preventScroll: true });
    if (selectMarket) return;
    try {
      await loadScripts();
    } catch {
      if (!screen.open) {
        showStart();
        status.textContent = 'The globe couldn’t load. Choose a market to retry.';
      }
      return;
    }
    if (!screen.open) initGame();
  }
  close.addEventListener('click', dismissStart);
  screen.addEventListener('click', event => {
    if (event.target !== screen) return;
    const box = screen.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismissStart();
  });
  screen.addEventListener('cancel', event => {
    event.preventDefault();
    dismissStart();
  });
  action.addEventListener('click', showStart);

  for (const id of Game.startCountries) {
    const country = Game.countries[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.startCountry = id;
    const detail = document.createElement('small');
    detail.textContent = country.adoption > 1
      ? '+' + Math.round((country.adoption - 1) * 100) + '% AI speed'
      : '+' + Math.round((country.value - 1) * 100) + '% job value';
    button.append(country.name, detail);
    choices.append(button);
  }
  choices.addEventListener('click', async event => {
    const choice = event.target.closest('button');
    if (!choice || choice.disabled) return;
    close.disabled = true;
    for (const button of choices.children) button.disabled = true;
    choice.setAttribute('aria-busy', 'true');
    const country = choice.dataset.startCountry;
    status.textContent = 'Opening ' + Game.countries[country].name + '…';
    try {
      await loadScripts();
    } catch {
      showStart();
      status.textContent = 'The game couldn’t load. Choose a market to retry.';
      choice.focus();
      return;
    }
    initGame();
    screen.close();
    selectMarket(country);
  });

  showStart();
  // Warm the scripts after the choices paint. A tap can start or retry the same downloads.
  requestAnimationFrame(() => setTimeout(() => loadScripts().catch(() => {}), 0));
})();
